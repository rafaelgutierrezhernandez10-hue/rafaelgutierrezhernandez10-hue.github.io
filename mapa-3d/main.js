/* ==================================================================
   MAPA 3D — Sur y Sureste de México (Three.js r147, versión global)
   ------------------------------------------------------------------
   Flujo general:
     1. Se construye una malla 3D extruida por cada estado a partir de
        los polígonos de js/geo-estados.js (generados desde GeoJSON).
     2. Hover: solo el estado bajo el cursor se eleva y se ilumina.
     3. Clic izquierdo: se llena y muestra el panel con los datos de
        js/datos-estados.js (editable).
     4. Cámara orbital propia: arrastrar = girar, rueda/pellizco = zoom.
   ================================================================== */
(function () {
  'use strict';

  /* ---------- 0. Comprobaciones iniciales ---------- */
  if (typeof THREE === 'undefined') {
    document.getElementById('error').hidden = false;   // sin CDN no hay 3D
    return;
  }

  /* ---------- 1. Parámetros ajustables ---------- */
  var ESCALA        = 0.01;   // px del GeoJSON → unidades 3D
  var GROSOR_ESTADO = 0.18;   // altura base de los estados del proyecto
  var GROSOR_VECINO = 0.04;   // altura de los estados de contexto (gris)
  var ELEVA_HOVER   = 0.45;   // cuánto sube el estado bajo el cursor
  var ELEVA_SELECC  = 0.20;   // cuánto se mantiene elevado el seleccionado
  var SUAVIZADO     = 0.12;   // 0-1: rapidez de la animación de elevación

  /* ---------- 2. Referencias DOM ---------- */
  var contenedor = document.getElementById('escena');
  var capaEtiq   = document.getElementById('etiquetas');
  var panel      = document.getElementById('panel');
  var GEO        = window.GEO_ESTADOS;
  var DATOS      = window.DATOS_ESTADOS;
  var NIVELES    = window.NIVELES;

  /* ---------- 3. Escena, cámara y render ---------- */
  var escena = new THREE.Scene();
  var camara = new THREE.PerspectiveCamera(45, 1, 0.1, 100);

  var render = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  render.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  contenedor.appendChild(render.domElement);

  /* Luces */
  escena.add(new THREE.HemisphereLight(0xdff7ea, 0x0a1f16, 0.85));
  var sol = new THREE.DirectionalLight(0xffffff, 0.9);
  sol.position.set(-4, 8, 6);
  escena.add(sol);

  /* "Mar": plano oscuro bajo el mapa */
  var mar = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ color: 0x0c2a33, roughness: 1 })
  );
  mar.rotation.x = -Math.PI / 2;
  mar.position.y = -0.02;
  escena.add(mar);

  /* ---------- 4. Construcción de los estados ---------- */
  var anchoMundo = GEO.width * ESCALA, altoMundo = GEO.height * ESCALA;
  var estados = {};          // id → { grupo, materiales[], ancla{x,z}, y, intensidad }
  var mallasPicking = [];    // mallas que reaccionan al cursor

  /** Convierte un anillo [[x,y],...] (px SVG) en un THREE.Shape centrado. */
  function anilloAShape(anillo) {
    var forma = new THREE.Shape();
    anillo.forEach(function (p, i) {
      var x = (p[0] - GEO.width / 2) * ESCALA;
      var y = (GEO.height / 2 - p[1]) * ESCALA;   // invertimos y: norte arriba
      if (i === 0) forma.moveTo(x, y); else forma.lineTo(x, y);
    });
    return forma;
  }

  /** Área de un anillo (para elegir el polígono principal del estado). */
  function area(anillo) {
    var a = 0;
    for (var i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
      a += (anillo[j][0] * anillo[i][1]) - (anillo[i][0] * anillo[j][1]);
    }
    return Math.abs(a / 2);
  }

  /** ¿Punto dentro del polígono? (trazado de rayos) */
  function dentro(px, py, anillo) {
    var d = false;
    for (var i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
      var xi = anillo[i][0], yi = anillo[i][1], xj = anillo[j][0], yj = anillo[j][1];
      if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) d = !d;
    }
    return d;
  }

  /** Distancia de un punto al borde del polígono. */
  function distBorde(px, py, anillo) {
    var min = Infinity;
    for (var i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
      var ax = anillo[j][0], ay = anillo[j][1], bx = anillo[i][0], by = anillo[i][1];
      var dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
      var t = l2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2)) : 0;
      var d = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
      if (d < min) min = d;
    }
    return min;
  }

  /** Punto interior "más centrado" del polígono: sirve de ancla para la etiqueta. */
  function puntoInterior(anillo) {
    var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    anillo.forEach(function (p) {
      x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]);
      y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]);
    });
    var mejor = { x: (x0 + x1) / 2, y: (y0 + y1) / 2, d: -1 };
    for (var i = 1; i < 30; i++) {
      for (var j = 1; j < 30; j++) {
        var px = x0 + (x1 - x0) * i / 30, py = y0 + (y1 - y0) * j / 30;
        if (!dentro(px, py, anillo)) continue;
        var d = distBorde(px, py, anillo);
        if (d > mejor.d) mejor = { x: px, y: py, d: d };
      }
    }
    return mejor;
  }

  GEO.estados.forEach(function (e) {
    var grupo = new THREE.Group();
    var materiales = [];
    var nivel = e.focus && DATOS[e.id] ? NIVELES[DATOS[e.id].nivel] : null;

    var material = new THREE.MeshStandardMaterial({
      color: nivel ? nivel.color : 0x1d3b30,
      roughness: 0.55,
      metalness: 0.05,
      emissive: nivel ? nivel.color : 0x000000,
      emissiveIntensity: 0
    });
    materiales.push(material);

    e.rings.forEach(function (anillo) {
      var geo = new THREE.ExtrudeGeometry(anilloAShape(anillo), {
        depth: e.focus ? GROSOR_ESTADO : GROSOR_VECINO,
        bevelEnabled: false
      });
      geo.rotateX(-Math.PI / 2);                       // de plano XY a "suelo" XZ
      var malla = new THREE.Mesh(geo, material);
      malla.userData.id = e.focus ? e.id : null;
      grupo.add(malla);

      /* Contorno del estado */
      var borde = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo, 30),
        new THREE.LineBasicMaterial({
          color: 0xffffff, transparent: true, opacity: e.focus ? 0.55 : 0.12
        })
      );
      grupo.add(borde);

      if (e.focus) mallasPicking.push(malla);
    });

    escena.add(grupo);

    if (e.focus) {
      /* Ancla de la etiqueta: punto interior del anillo más grande */
      var principal = e.rings.slice().sort(function (a, b) { return area(b) - area(a); })[0];
      var pi = puntoInterior(principal);
      estados[e.id] = {
        grupo: grupo,
        material: material,
        ancla: { x: (pi.x - GEO.width / 2) * ESCALA, z: (pi.y - GEO.height / 2) * ESCALA },
        y: 0,
        intensidad: 0
      };

      var et = document.createElement('div');
      et.className = 'etiqueta';
      et.textContent = DATOS[e.id].name;
      capaEtiq.appendChild(et);
      estados[e.id].etiqueta = et;
    }
  });

  /* ---------- 5. Cámara orbital propia ---------- */
  var orbita = { az: 0, pol: 0.85, dist: 9.5, objAz: 0, objPol: 0.85, objDist: 9.5 };

  function limitar(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function actualizarCamara() {
    // Suavizado hacia el objetivo
    orbita.az   += (orbita.objAz   - orbita.az)   * 0.15;
    orbita.pol  += (orbita.objPol  - orbita.pol)  * 0.15;
    orbita.dist += (orbita.objDist - orbita.dist) * 0.15;
    camara.position.set(
      orbita.dist * Math.sin(orbita.pol) * Math.sin(orbita.az),
      orbita.dist * Math.cos(orbita.pol),
      orbita.dist * Math.sin(orbita.pol) * Math.cos(orbita.az)
    );
    camara.lookAt(0, 0, 0);
  }

  /* ---------- 6. Interacción: puntero, arrastre, clic y zoom ---------- */
  var rayo = new THREE.Raycaster();
  var ndc = new THREE.Vector2();
  var hoverId = null, seleccionId = null;
  var punteros = {};            // punteros activos (para pellizco táctil)
  var inicio = null;            // datos del gesto actual
  var distPellizco = 0;

  /** Devuelve el id del estado bajo las coordenadas de pantalla, o null. */
  function estadoEn(clientX, clientY) {
    var r = render.domElement.getBoundingClientRect();
    ndc.x = ((clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((clientY - r.top) / r.height) * 2 + 1;
    rayo.setFromCamera(ndc, camara);
    var hit = rayo.intersectObjects(mallasPicking, false)[0];
    return hit ? hit.object.userData.id : null;
  }

  var lienzo = render.domElement;

  lienzo.addEventListener('pointerdown', function (ev) {
    lienzo.setPointerCapture(ev.pointerId);
    punteros[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
    inicio = { x: ev.clientX, y: ev.clientY, movido: false, boton: ev.button };
    contenedor.classList.add('arrastrando');
  });

  lienzo.addEventListener('pointermove', function (ev) {
    var ids = Object.keys(punteros);

    /* Sin botón presionado: solo hover (ratón) */
    if (!punteros[ev.pointerId]) {
      var id = estadoEn(ev.clientX, ev.clientY);
      if (id !== hoverId) {
        hoverId = id;
        contenedor.classList.toggle('sobre-estado', !!id);
      }
      return;
    }

    var previo = punteros[ev.pointerId];
    var dx = ev.clientX - previo.x, dy = ev.clientY - previo.y;
    punteros[ev.pointerId] = { x: ev.clientX, y: ev.clientY };

    if (ids.length >= 2) {                       // pellizco → zoom
      var a = punteros[ids[0]], b = punteros[ids[1]];
      var d = Math.hypot(a.x - b.x, a.y - b.y);
      if (distPellizco) orbita.objDist = limitar(orbita.objDist * (distPellizco / d), 4, 16);
      distPellizco = d;
      if (inicio) inicio.movido = true;
      return;
    }

    if (inicio && Math.hypot(ev.clientX - inicio.x, ev.clientY - inicio.y) > 5) inicio.movido = true;
    if (inicio && inicio.movido) {               // un dedo/ratón → girar
      orbita.objAz  = limitar(orbita.objAz  - dx * 0.005, -1.1, 1.1);
      orbita.objPol = limitar(orbita.objPol - dy * 0.005, 0.2, 1.35);
      hoverId = null;
      contenedor.classList.remove('sobre-estado');
    }
  });

  function soltar(ev) {
    var eraClic = inicio && !inicio.movido && inicio.boton === 0 && Object.keys(punteros).length === 1;
    delete punteros[ev.pointerId];
    distPellizco = 0;
    contenedor.classList.remove('arrastrando');
    if (eraClic && ev.type === 'pointerup') {
      var id = estadoEn(ev.clientX, ev.clientY);
      if (id) seleccionar(id); else cerrarPanel();
    }
    if (Object.keys(punteros).length === 0) inicio = null;
  }
  lienzo.addEventListener('pointerup', soltar);
  lienzo.addEventListener('pointercancel', soltar);
  lienzo.addEventListener('pointerleave', function () {
    if (!Object.keys(punteros).length) { hoverId = null; contenedor.classList.remove('sobre-estado'); }
  });

  lienzo.addEventListener('wheel', function (ev) {
    ev.preventDefault();
    orbita.objDist = limitar(orbita.objDist * (1 + Math.sign(ev.deltaY) * 0.08), 4, 16);
  }, { passive: false });

  /* ---------- 7. Panel de información ---------- */
  function seleccionar(id) {
    var d = DATOS[id], n = NIVELES[d.nivel];
    seleccionId = id;

    document.getElementById('p-nombre').textContent = d.name;
    var badge = document.getElementById('p-nivel');
    badge.textContent = n.etiqueta;
    badge.style.background = n.css;

    // Valor mensual = anual / 12 (misma lógica que cpp/emisiones.cpp)
    document.getElementById('p-anio').textContent = d.gei_anual.toFixed(1);
    document.getElementById('p-mes').textContent  = (d.gei_anual / 12).toFixed(2);
    document.getElementById('p-cabezas').textContent = d.cabezas.toLocaleString('es-MX');
    document.getElementById('p-sup').textContent  = d.superficie.toLocaleString('es-MX');
    document.getElementById('p-contexto').textContent = d.contexto;

    panel.hidden = false;
  }

  function cerrarPanel() {
    seleccionId = null;
    panel.hidden = true;
  }
  document.getElementById('cerrar').addEventListener('click', cerrarPanel);
  window.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') cerrarPanel(); });

  /* ---------- 8. Tamaño responsive ---------- */
  function redimensionar() {
    var w = window.innerWidth, h = window.innerHeight;
    render.setSize(w, h);
    camara.aspect = w / h;
    // En pantallas verticales (móvil) alejamos un poco para que quepa el mapa
    camara.fov = w / h < 0.9 ? 60 : 45;
    camara.updateProjectionMatrix();
  }
  window.addEventListener('resize', redimensionar);
  redimensionar();

  /* ---------- 9. Bucle de animación ---------- */
  var v = new THREE.Vector3();

  function animar() {
    requestAnimationFrame(animar);
    actualizarCamara();

    Object.keys(estados).forEach(function (id) {
      var s = estados[id];
      var objetivoY = id === hoverId ? ELEVA_HOVER : (id === seleccionId ? ELEVA_SELECC : 0);
      var objetivoI = id === hoverId ? 0.55 : (id === seleccionId ? 0.3 : 0);

      s.y += (objetivoY - s.y) * SUAVIZADO;                 // solo este estado sube
      s.intensidad += (objetivoI - s.intensidad) * SUAVIZADO;
      s.grupo.position.y = s.y;
      s.material.emissiveIntensity = s.intensidad;

      // Posición de la etiqueta en pantalla
      v.set(s.ancla.x, s.y + GROSOR_ESTADO + 0.02, s.ancla.z).project(camara);
      s.etiqueta.style.left = ((v.x * 0.5 + 0.5) * window.innerWidth) + 'px';
      s.etiqueta.style.top  = ((-v.y * 0.5 + 0.5) * window.innerHeight) + 'px';
    });

    render.render(escena, camara);
  }
  animar();

})();

