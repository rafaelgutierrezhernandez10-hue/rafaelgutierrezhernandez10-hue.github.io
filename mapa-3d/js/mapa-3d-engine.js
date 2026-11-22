/* =========================================================================
   MOTOR 3D INTERACTIVO — MITAD SUR DE MÉXICO (Itescohuella)
   -------------------------------------------------------------------------
   Renderizador 3D volumétrico en HTML5 Canvas + Controlador del Panel de
   Información Flotante 3D (con animaciones 3D de apertura, cierre, giro de
   intercambio entre estados, conteo numérico animado e inclinación 3D Tilt).
   ========================================================================= */
(function () {
    'use strict';

    /* =====================================================================
       1. DATOS ESPECÍFICOS DE MINATITLÁN Y COATZACOALCOS (SUR DE VERACRUZ)
       ===================================================================== */
    var VERACRUZ_CITIES_DATA = {
        minatitlan: {
            id: 'minatitlan',
            name: 'Minatitlán',
            zone: 'Cuenca baja e interior aluvial del río Coatzacoalcos',
            tag: 'Dato de referencia / estimación para prototipo',
            co2Year: '0.42 Mt CO₂eq / año (~420,000 t)',
            co2Month: '0.035 Mt CO₂eq / mes (~35,000 t)',
            cattleHead: '~165,000 cabezas bovinas (municipio y zona rural)',
            pastureArea: '~148,000 ha de pastizales y llanura inundable',
            mapCoords: { x: 538, y: 296 },
            phaseOffset: 0.0,
            context: 'Uno de los municipios con mayor vocación ganadera extensiva en el sur de Veracruz (zona rural del Uxpanapa y llanuras del Coatzacoalcos). La conversión histórica de humedales, popales y selva alta en potreros de pastoreo reduce la retención natural de agua, compacta suelos aluviales y genera altas emisiones de metano entérico (CH₄) y óxido nitroso (N₂O) que se suman a la huella ambiental de la cuenca.'
        },
        coatzacoalcos: {
            id: 'coatzacoalcos',
            name: 'Coatzacoalcos',
            zone: 'Desembocadura costera y cuenca baja del río Coatzacoalcos',
            tag: 'Dato de referencia / estimación para prototipo',
            co2Year: '0.28 Mt CO₂eq / año (~280,000 t agropecuarias y abasto)',
            co2Month: '0.023 Mt CO₂eq / mes (~23,300 t)',
            cattleHead: '~68,000 cabezas bovinas + nodo regional de consumo',
            pastureArea: '~54,000 ha de pastizal costero y periurbano',
            mapCoords: { x: 564, y: 273 },
            phaseOffset: 2.1,
            context: 'En la franja costera y desembocadura del río Coatzacoalcos, la ganadería periurbana y el establecimiento de potreros han ejercido presión sobre humedales costeros, manglares, pantanos y dunas. Además de la degradación de suelos hidromórficos locales, como centro urbano concentra una elevada huella ecológica indirecta por la demanda, transporte y consumo diario de carne bovina y lácteos provenientes de toda la región Olmeca.'
        }
    };

    window.VERACRUZ_CITIES_DATA = VERACRUZ_CITIES_DATA;

    /* =====================================================================
       2. BASE DE DATOS EDITABLE DE ESTADOS (Mitad Sur de México: 14 estados)
       ===================================================================== */
    var STATES_3D_DATA = {
        veracruz: {
            id: 'veracruz',
            name: 'Veracruz',
            shortName: '★ VERACRUZ',
            isFeatured: true,
            level: 'critico',
            badgeText: 'Riesgo Crítico · Foco Regional',
            badgeClass: 'badge-critico',
            impactPct: 95,
            baseHeight: 28,
            co2Year: 8.20,
            co2Month: 0.68,
            headCount: '4,200,000',
            landUse: '3,850',
            pctNacional: '~13.2% del inventario bovino nacional · Dato de referencia / estimación',
            topColor: '#ef4444',
            sideColor: '#991b1b',
            strokeColor: '#fde047',
            customCenter: { x: 408, y: 168 },
            labelOffset: [16, -12],
            context: 'Primer lugar nacional en inventario bovino con más de 4.2 millones de cabezas. La expansión de potreros ha sustituido extensas áreas de selvas húmedas y bosque mesófilo. En el sur del estado —especialmente en la cuenca baja del río Coatzacoalcos (Minatitlán y Coatzacoalcos)— la conversión de humedales y selvas inundables a pastizales intensifica la degradación del suelo y las emisiones de metano (CH₄).',
            subregions: VERACRUZ_CITIES_DATA
        },
        chiapas: {
            id: 'chiapas',
            name: 'Chiapas',
            shortName: 'Chiapas',
            level: 'critico',
            badgeText: 'Riesgo Crítico',
            badgeClass: 'badge-critico',
            impactPct: 88,
            baseHeight: 22,
            co2Year: 6.50,
            co2Month: 0.54,
            headCount: '3,100,000',
            landUse: '3,200',
            pctNacional: '~8.5% del inventario bovino nacional · Dato de referencia / estimación',
            topColor: '#dc2626',
            sideColor: '#7f1d1d',
            strokeColor: '#fecaca',
            labelOffset: [0, 5],
            context: 'Concentra una de las tasas más altas de cambio de uso de suelo forestal a pastizal ganadero, afectando zonas de amortiguamiento de la Selva Lacandona. La pérdida de cobertura arbórea libera grandes volúmenes de CO₂ almacenado en biomasa y fragmenta hábitats de altísima biodiversidad.'
        },
        michoacan: {
            id: 'michoacan',
            name: 'Michoacán',
            shortName: 'Michoacán',
            level: 'alto',
            badgeText: 'Riesgo Alto',
            badgeClass: 'badge-alto',
            impactPct: 68,
            baseHeight: 18,
            co2Year: 3.40,
            co2Month: 0.28,
            headCount: '1,950,000',
            landUse: '1,780',
            pctNacional: '~5.3% del inventario bovino nacional · Dato de referencia / estimación',
            topColor: '#f97316',
            sideColor: '#9a3412',
            strokeColor: '#fed7aa',
            labelOffset: [-4, 2],
            context: 'Importante productor bovino en el occidente-sur, especialmente en Tierra Caliente y la costa. La ganadería extensiva y el cambio de uso de suelo generan erosión en zonas de ladera, pérdida de selva baja caducifolia y presión sobre bosques templados e hidrológicos.'
        },
        tabasco: {
            id: 'tabasco',
            name: 'Tabasco',
            shortName: 'Tabasco',
            level: 'alto',
            badgeText: 'Riesgo Alto',
            badgeClass: 'badge-alto',
            impactPct: 72,
            baseHeight: 19,
            co2Year: 3.80,
            co2Month: 0.32,
            headCount: '1,850,000',
            landUse: '1,420',
            pctNacional: '~4.9% del inventario bovino nacional · Dato de referencia / estimación',
            topColor: '#fb923c',
            sideColor: '#9a3412',
            strokeColor: '#fed7aa',
            labelOffset: [8, -2],
            context: 'Transformación histórica de humedales tropicales y selvas inundables en pastizales para ganadería extensiva en llanura húmeda. La compactación del suelo reduce la capacidad de infiltración hídrica y presiona el sistema hidrológico Grijalva-Usumacinta y los manglares costeros.'
        },
        guerrero: {
            id: 'guerrero',
            name: 'Guerrero',
            shortName: 'Guerrero',
            level: 'medio',
            badgeText: 'Riesgo Medio-Alto',
            badgeClass: 'badge-medio',
            impactPct: 56,
            baseHeight: 16,
            co2Year: 2.60,
            co2Month: 0.22,
            headCount: '1,520,000',
            landUse: '1,690',
            pctNacional: '~3.9% del inventario bovino nacional · Dato de referencia / estimación',
            topColor: '#eab308',
            sideColor: '#854d0e',
            strokeColor: '#fef08a',
            labelOffset: [0, 4],
            context: 'Ganadería bovina de doble propósito distribuida en Costa Chica, Costa Grande y Tierra Caliente. El pastoreo libre en terrenos montañosos acelera la pérdida de cobertura vegetal, incrementa la escorrentía superficial y degrada suelos vulnerables a lluvias torrenciales.'
        },
        oaxaca: {
            id: 'oaxaca',
            name: 'Oaxaca',
            shortName: 'Oaxaca',
            level: 'medio',
            badgeText: 'Riesgo Medio',
            badgeClass: 'badge-medio',
            impactPct: 52,
            baseHeight: 15,
            co2Year: 2.40,
            co2Month: 0.20,
            headCount: '1,400,000',
            landUse: '1,650',
            pctNacional: '~3.6% del inventario bovino nacional · Dato de referencia / estimación',
            topColor: '#facc15',
            sideColor: '#854d0e',
            strokeColor: '#fef08a',
            labelOffset: [-6, 8],
            context: 'Ganadería de escala media que combina sistemas tradicionales con pastoreo extensivo en la Costa, la Cuenca del Papaloapan y el Istmo de Tehuantepec. El principal reto ambiental es la erosión de laderas y la fragmentación de selvas secas y bosques.'
        },
        puebla: {
            id: 'puebla',
            name: 'Puebla',
            shortName: 'Puebla',
            level: 'medio',
            badgeText: 'Riesgo Medio',
            badgeClass: 'badge-medio',
            impactPct: 48,
            baseHeight: 14,
            co2Year: 2.10,
            co2Month: 0.18,
            headCount: '1,120,000',
            landUse: '1,150',
            pctNacional: '~2.9% del inventario bovino nacional · Dato de referencia / estimación',
            topColor: '#eab308',
            sideColor: '#713f12',
            strokeColor: '#fef08a',
            labelOffset: [-4, 6],
            context: 'Combina ganadería bovina en la Sierra Norte y Mixteca con cuencas lecheras, avícolas y porcícolas intensivas en el valle de Tehuacán y Tecamachalco. Genera fuerte demanda sobre acuíferos subterráneos y emisiones por manejo de excretas.'
        },
        edomex: {
            id: 'edomex',
            name: 'Estado de México',
            shortName: 'Edomex',
            level: 'moderado',
            badgeText: 'Impacto Moderado',
            badgeClass: 'badge-moderado',
            impactPct: 40,
            baseHeight: 13,
            co2Year: 1.65,
            co2Month: 0.14,
            headCount: '780,000',
            landUse: '690',
            pctNacional: '~2.0% del inventario bovino nacional · Dato de referencia / estimación',
            topColor: '#06b6d4',
            sideColor: '#155e75',
            strokeColor: '#a5f3fc',
            labelOffset: [-6, 0],
            context: 'Producción ganadera enfocada en cuencas lecheras y engorda semi-intensiva, además de pastoreo en el sur del estado (Tejupilco y Tlatlaya). Destaca también por su enorme demanda de productos cárnicos y lácteos en la zona conurbada del Valle de México.'
        },
        quintanaroo: {
            id: 'quintanaroo',
            name: 'Quintana Roo',
            shortName: 'Q. Roo',
            level: 'moderado',
            badgeText: 'Impacto Moderado',
            badgeClass: 'badge-moderado',
            impactPct: 35,
            baseHeight: 11,
            co2Year: 0.80,
            co2Month: 0.07,
            headCount: '180,000',
            landUse: '320',
            pctNacional: '~0.6% del inventario bovino nacional · Dato de referencia / estimación',
            topColor: '#06b6d4',
            sideColor: '#155e75',
            strokeColor: '#a5f3fc',
            labelOffset: [6, 5],
            context: 'Actividad bovina de menor escala concentrada en los municipios del sur (Othón P. Blanco y Bacalar), donde el desmonte para potreros presiona la selva mediana. En el resto del estado predomina la huella ambiental asociada al consumo alimentario en corredores turísticos.'
        },
        yucatan: {
            id: 'yucatan',
            name: 'Yucatán',
            shortName: 'Yucatán',
            level: 'bajo',
            badgeText: 'Riesgo Bajo (Bovino)',
            badgeClass: 'badge-bajo',
            impactPct: 28,
            baseHeight: 10,
            co2Year: 1.30,
            co2Month: 0.11,
            headCount: '520,000',
            landUse: '750',
            pctNacional: '~1.6% del inventario bovino nacional · Dato de referencia / estimación',
            topColor: '#3b82f6',
            sideColor: '#1e40af',
            strokeColor: '#bfdbfe',
            labelOffset: [0, -4],
            context: 'Inventario bovino moderado concentrado en el oriente del estado (Tizimín). Aunque la presión por ganado de res es menor que en Veracruz o Chiapas, el suelo kárstico altamente permeable hace que el acuífero subterráneo sea muy vulnerable a descargas agropecuarias.'
        },
        campeche: {
            id: 'campeche',
            name: 'Campeche',
            shortName: 'Campeche',
            level: 'bajo',
            badgeText: 'Riesgo Bajo',
            badgeClass: 'badge-bajo',
            impactPct: 25,
            baseHeight: 10,
            co2Year: 1.10,
            co2Month: 0.09,
            headCount: '480,000',
            landUse: '680',
            pctNacional: '~1.4% del inventario bovino nacional · Dato de referencia / estimación',
            topColor: '#2563eb',
            sideColor: '#1e3a8a',
            strokeColor: '#bfdbfe',
            labelOffset: [-4, 6],
            context: 'Densidad ganadera baja a moderada. La actividad pecuaria se ubica principalmente en las llanuras del suroeste (Palizada, Carmen y Candelaria). El reto prioritario es evitar la fragmentación del corredor biológico hacia la Reserva de la Biosfera de Calakmul.'
        },
        morelos: {
            id: 'morelos',
            name: 'Morelos',
            shortName: 'Morelos',
            level: 'bajo',
            badgeText: 'Riesgo Bajo',
            badgeClass: 'badge-bajo',
            impactPct: 20,
            baseHeight: 9,
            co2Year: 0.45,
            co2Month: 0.04,
            headCount: '145,000',
            landUse: '130',
            pctNacional: '~0.4% del inventario bovino nacional · Dato de referencia / estimación',
            topColor: '#3b82f6',
            sideColor: '#1d4ed8',
            strokeColor: '#bfdbfe',
            labelOffset: [0, 8],
            context: 'Territorio pequeño con ganadería bovina limitada y semi-estabulada. Aunque su inventario pecuario directo es reducido, enfrenta fuerte presión sobre el suelo agrícola y los recursos hídricos por la urbanización y la demanda alimentaria regional.'
        },
        tlaxcala: {
            id: 'tlaxcala',
            name: 'Tlaxcala',
            shortName: 'Tlaxcala',
            level: 'bajo',
            badgeText: 'Riesgo Bajo',
            badgeClass: 'badge-bajo',
            impactPct: 16,
            baseHeight: 8,
            co2Year: 0.35,
            co2Month: 0.03,
            headCount: '110,000',
            landUse: '95',
            pctNacional: '~0.3% del inventario bovino nacional · Dato de referencia / estimación',
            topColor: '#60a5fa',
            sideColor: '#1e40af',
            strokeColor: '#dbeafe',
            labelOffset: [0, -6],
            context: 'El estado de menor extensión territorial presenta baja producción ganadera primaria, predominando pequeñas unidades familiares de leche y agricultura de temporal (maíz y cebada). Su huella ganadera directa es de las más bajas del país.'
        },
        cdmx: {
            id: 'cdmx',
            name: 'Ciudad de México',
            shortName: 'CDMX',
            level: 'bajo',
            badgeText: 'Bajo (Producción) / Alto Consumo',
            badgeClass: 'badge-bajo',
            impactPct: 10,
            baseHeight: 8,
            co2Year: 0.12,
            co2Month: 0.01,
            headCount: '18,000',
            landUse: '12',
            pctNacional: '~0.05% producción directa · Mayor centro consumidor · Dato de referencia',
            topColor: '#38bdf8',
            sideColor: '#0369a1',
            strokeColor: '#e0f2fe',
            labelOffset: [-4, -4],
            context: 'La producción ganadera primaria dentro de la capital es mínima (restringida a zonas rurales de Milpa Alta, Tlalpan y Xochimilco). Sin embargo, como metrópoli concentra la mayor huella ecológica indirecta del país por el consumo masivo diario de carne y lácteos.'
        }
    };

    window.STATES_3D_DATA = STATES_3D_DATA;

    /* =====================================================================
       3. UTILIDADES MATEMÁTICAS Y GEOMÉTRICAS
       ===================================================================== */
    function hexToRgb(hex) {
        var c = hex.replace('#', '');
        if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
        var num = parseInt(c, 16);
        return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    }

    function shadeHex(hex, factor) {
        var rgb = hexToRgb(hex);
        var r = Math.max(0, Math.min(255, Math.round(rgb.r * factor)));
        var g = Math.max(0, Math.min(255, Math.round(rgb.g * factor)));
        var b = Math.max(0, Math.min(255, Math.round(rgb.b * factor)));
        return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    function pointInRing(px, py, ring) {
        var inside = false;
        for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            var xi = ring[i][0], yi = ring[i][1];
            var xj = ring[j][0], yj = ring[j][1];
            var intersect = ((yi > py) !== (yj > py)) &&
                (px < (xj - xi) * (py - yi) / ((yj - yi) || 1e-9) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    function ringArea(ring) {
        var a = 0;
        for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            a += (ring[j][0] * ring[i][1]) - (ring[i][0] * ring[j][1]);
        }
        return Math.abs(a * 0.5);
    }

    function findInteriorPoint(ring) {
        var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (var i = 0; i < ring.length; i++) {
            var p = ring[i];
            if (p[0] < minX) minX = p[0];
            if (p[0] > maxX) maxX = p[0];
            if (p[1] < minY) minY = p[1];
            if (p[1] > maxY) maxY = p[1];
        }
        var best = { x: (minX + maxX) * 0.5, y: (minY + maxY) * 0.5, d: -1 };
        var steps = 16;
        for (var ix = 1; ix < steps; ix++) {
            for (var iy = 1; iy < steps; iy++) {
                var tx = minX + (maxX - minX) * (ix / steps);
                var ty = minY + (maxY - minY) * (iy / steps);
                if (!pointInRing(tx, ty, ring)) continue;
                var minDist = Infinity;
                for (var k = 0; k < ring.length; k++) {
                    var dist = Math.hypot(ring[k][0] - tx, ring[k][1] - ty);
                    if (dist < minDist) minDist = dist;
                }
                if (minDist > best.d) best = { x: tx, y: ty, d: minDist };
            }
        }
        return best;
    }

    function simplifyRing(ring, minStep) {
        var out = [];
        var lx = -9999, ly = -9999;
        for (var i = 0; i < ring.length; i++) {
            var x = ring[i][0], y = ring[i][1];
            if (Math.hypot(x - lx, y - ly) >= minStep || i === 0 || i === ring.length - 1) {
                out.push([x, y]);
                lx = x;
                ly = y;
            }
        }
        return out.length >= 3 ? out : ring;
    }

    function drawTwinkleStar(ctx, cx, cy, outerR, innerR, alpha, color) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.fillStyle = color;
        ctx.beginPath();
        for (var i = 0; i < 8; i++) {
            var angle = (i * Math.PI) / 4;
            var r = (i % 2 === 0) ? outerR : innerR;
            var px = cx + Math.cos(angle) * r;
            var py = cy + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    /* Animación suave de números (para GEI al año y al mes cuando el panel 3D cambia de estado) */
    function animateDecimalValue(el, targetVal, decimals) {
        if (!el) return;
        var startVal = parseFloat(el.textContent) || 0;
        var diff = targetVal - startVal;
        var duration = 420;
        var startTime = null;

        function step(ts) {
            if (!startTime) startTime = ts;
            var p = Math.min(1, (ts - startTime) / duration);
            var ease = 1 - Math.pow(1 - p, 3);
            var cur = startVal + diff * ease;
            el.textContent = cur.toFixed(decimals);
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = targetVal.toFixed(decimals);
        }
        requestAnimationFrame(step);
    }

    /* =====================================================================
       4. CONSTRUCTOR DEL VISOR 3D + PANEL FLOTANTE 3D ANIMADO
       ===================================================================== */
    function createMapa3D(options) {
        var canvas = document.getElementById(options.canvasId);
        if (!canvas || !window.GEO_ESTADOS) return null;

        var ctx = canvas.getContext('2d');
        var GEO = window.GEO_ESTADOS;

        var LIFT_FEATURED_BASE  = 6;
        var LIFT_HOVER          = 26;
        var LIFT_SELECTED       = 42;
        var LIFT_SELECTED_HOVER = 48;

        var cam = {
            yaw: -0.14,
            pitch: 0.62,
            zoom: 1.02,
            targetYaw: -0.14,
            targetPitch: 0.62,
            targetZoom: 1.02,
            autoRotate: false
        };

        var hoveredId        = null;
        var hoveredCityId    = null;
        var selectedId       = options.initialState !== undefined ? options.initialState : 'veracruz';
        var lastRenderedId   = null;
        var selectedCityId   = 'minatitlan';
        var cityTwinkleBoost = { minatitlan: 0, coatzacoalcos: 0 };
        var swapTimer        = null;

        var focusPieces   = [];
        var contextPieces = [];
        var cityScreenPts = [];

        GEO.estados.forEach(function (st) {
            var simplifiedRings = st.rings.map(function (r) {
                return simplifyRing(r, st.focus ? 2.0 : 4.2);
            });

            var mainRing = simplifiedRings.slice().sort(function (a, b) {
                return ringArea(b) - ringArea(a);
            })[0];
            var autoCenter = findInteriorPoint(mainRing);

            if (st.focus && STATES_3D_DATA[st.id]) {
                var info = STATES_3D_DATA[st.id];
                var center = info.customCenter || autoCenter;
                var initLift = (st.id === selectedId)
                    ? LIFT_SELECTED
                    : (info.isFeatured ? LIFT_FEATURED_BASE : 0);
                focusPieces.push({
                    id: st.id,
                    name: info.name,
                    info: info,
                    rings: simplifiedRings,
                    center: center,
                    baseH: info.baseHeight,
                    currentLift: initLift,
                    targetLift: initLift,
                    screenPolys: [],
                    labelScreen: { x: 0, y: 0 },
                    depthKey: 0
                });
            } else {
                contextPieces.push({
                    name: st.name,
                    rings: simplifiedRings,
                    center: autoCenter,
                    baseH: 4
                });
            }
        });

        var mapCx = GEO.width * 0.50;
        var mapCy = GEO.height * 0.53;

        function project3D(mx, my, mz, viewW, viewH) {
            var rx = mx - mapCx;
            var ry = my - mapCy;

            var cosY = Math.cos(cam.yaw);
            var sinY = Math.sin(cam.yaw);
            var x1 = rx * cosY - ry * sinY;
            var y1 = rx * sinY + ry * cosY;

            var cosP = Math.cos(cam.pitch);
            var sinP = Math.sin(cam.pitch);
            var y2 = y1 * cosP - mz * sinP;
            var zDepth = y1 * sinP + mz * cosP;

            var baseScale = Math.min(viewW / (GEO.width * 0.96), viewH / (GEO.height * 0.88)) * cam.zoom;
            var perspective = 1 + (y1 / 1500) * Math.sin(cam.pitch) * 0.34;
            var s = baseScale * perspective;

            return {
                x: viewW * 0.50 + x1 * s,
                y: viewH * 0.54 + y2 * s,
                depth: zDepth,
                scale: s
            };
        }

        function drawBasePlatform(w, h) {
            var padX = 485, padY = 235;
            var corners = [
                project3D(mapCx - padX, mapCy - padY, -6, w, h),
                project3D(mapCx + padX, mapCy - padY, -6, w, h),
                project3D(mapCx + padX, mapCy + padY, -6, w, h),
                project3D(mapCx - padX, mapCy + padY, -6, w, h)
            ];
            var cornersBottom = [
                project3D(mapCx - padX, mapCy - padY, -18, w, h),
                project3D(mapCx + padX, mapCy - padY, -18, w, h),
                project3D(mapCx + padX, mapCy + padY, -18, w, h),
                project3D(mapCx - padX, mapCy + padY, -18, w, h)
            ];

            for (var i = 0; i < 4; i++) {
                var next = (i + 1) % 4;
                ctx.beginPath();
                ctx.moveTo(corners[i].x, corners[i].y);
                ctx.lineTo(corners[next].x, corners[next].y);
                ctx.lineTo(cornersBottom[next].x, cornersBottom[next].y);
                ctx.lineTo(cornersBottom[i].x, cornersBottom[i].y);
                ctx.closePath();
                ctx.fillStyle = i === 1 || i === 2 ? 'rgba(6, 40, 32, 0.95)' : 'rgba(10, 58, 45, 0.85)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(74, 222, 128, 0.22)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.moveTo(corners[0].x, corners[0].y);
            for (var c = 1; c < 4; c++) ctx.lineTo(corners[c].x, corners[c].y);
            ctx.closePath();
            var grad = ctx.createLinearGradient(0, corners[0].y, 0, corners[2].y);
            grad.addColorStop(0, 'rgba(12, 48, 58, 0.72)');
            grad.addColorStop(1, 'rgba(8, 33, 43, 0.92)');
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.strokeStyle = 'rgba(103, 232, 249, 0.28)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.strokeStyle = 'rgba(103, 232, 249, 0.07)';
            ctx.lineWidth = 1;
            for (var gx = -420; gx <= 420; gx += 84) {
                var p1 = project3D(mapCx + gx, mapCy - padY, -5, w, h);
                var p2 = project3D(mapCx + gx, mapCy + padY, -5, w, h);
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
            for (var gy = -180; gy <= 180; gy += 60) {
                var q1 = project3D(mapCx - padX, mapCy + gy, -5, w, h);
                var q2 = project3D(mapCx + padX, mapCy + gy, -5, w, h);
                ctx.beginPath();
                ctx.moveTo(q1.x, q1.y);
                ctx.lineTo(q2.x, q2.y);
                ctx.stroke();
            }
        }

        function drawExtrudedState(rings, zBottom, zTop, topHex, sideHex, strokeColor, isHover, isSelected, isFeatured, w, h) {
            var screenPolys = [];

            if (zBottom > 1) {
                ctx.save();
                rings.forEach(function (ring) {
                    ctx.beginPath();
                    for (var i = 0; i < ring.length; i++) {
                        var sp = project3D(ring[i][0] + 6, ring[i][1] + 9, 0, w, h);
                        if (i === 0) ctx.moveTo(sp.x, sp.y);
                        else ctx.lineTo(sp.x, sp.y);
                    }
                    ctx.closePath();
                    ctx.fillStyle = isSelected ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 0, 0, 0.36)';
                    ctx.fill();
                });
                ctx.restore();
            }

            var quads = [];
            rings.forEach(function (ring) {
                for (var i = 0; i < ring.length; i++) {
                    var next = (i + 1) % ring.length;
                    var a = ring[i], b = ring[next];
                    var b0 = project3D(a[0], a[1], zBottom, w, h);
                    var b1 = project3D(b[0], b[1], zBottom, w, h);
                    var t1 = project3D(b[0], b[1], zTop, w, h);
                    var t0 = project3D(a[0], a[1], zTop, w, h);

                    var dx = b1.x - b0.x;
                    var dy = b1.y - b0.y;
                    var len = Math.hypot(dx, dy) || 1;
                    var light = 0.72 + 0.28 * ((dx / len) * 0.6 + (dy / len) * 0.8);

                    quads.push({
                        b0: b0, b1: b1, t1: t1, t0: t0,
                        depth: (b0.y + b1.y + t0.y + t1.y) * 0.25,
                        light: light
                    });
                }
            });

            quads.sort(function (q1, q2) { return q1.depth - q2.depth; });

            var sideBoost = isSelected ? 1.28 : (isHover ? 1.18 : (isFeatured ? 1.12 : 1.0));
            for (var q = 0; q < quads.length; q++) {
                var quad = quads[q];
                ctx.beginPath();
                ctx.moveTo(quad.b0.x, quad.b0.y);
                ctx.lineTo(quad.b1.x, quad.b1.y);
                ctx.lineTo(quad.t1.x, quad.t1.y);
                ctx.lineTo(quad.t0.x, quad.t0.y);
                ctx.closePath();
                ctx.fillStyle = shadeHex(sideHex, quad.light * sideBoost);
                ctx.fill();
                ctx.strokeStyle = shadeHex(sideHex, quad.light * 0.85);
                ctx.lineWidth = 0.6;
                ctx.stroke();
            }

            rings.forEach(function (ring) {
                var poly = [];
                ctx.beginPath();
                for (var i = 0; i < ring.length; i++) {
                    var tp = project3D(ring[i][0], ring[i][1], zTop, w, h);
                    poly.push([tp.x, tp.y]);
                    if (i === 0) ctx.moveTo(tp.x, tp.y);
                    else ctx.lineTo(tp.x, tp.y);
                }
                ctx.closePath();

                var cTop = shadeHex(topHex, isSelected ? 1.30 : (isHover ? 1.20 : (isFeatured ? 1.14 : 1.04)));
                var cBot = shadeHex(topHex, isSelected ? 1.08 : (isHover ? 1.00 : (isFeatured ? 0.94 : 0.86)));
                var g = ctx.createLinearGradient(0, h * 0.2, 0, h * 0.8);
                g.addColorStop(0, cTop);
                g.addColorStop(1, cBot);
                ctx.fillStyle = g;
                ctx.fill();

                if (isFeatured) {
                    ctx.save();
                    ctx.strokeStyle = isSelected ? '#fde047' : 'rgba(253, 224, 71, 0.85)';
                    ctx.lineWidth   = isSelected ? 3.0 : (isHover ? 2.6 : 2.0);
                    ctx.stroke();
                    ctx.restore();
                } else {
                    ctx.strokeStyle = isSelected ? '#ffffff' : (isHover ? '#bbf7d0' : strokeColor);
                    ctx.lineWidth   = isSelected ? 2.5 : (isHover ? 2.0 : 1.15);
                    ctx.stroke();
                }

                screenPolys.push(poly);
            });

            return screenPolys;
        }

        function resizeCanvas() {
            var rect = canvas.parentElement.getBoundingClientRect();
            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            var w = Math.max(300, Math.floor(rect.width));
            var h = Math.max(380, Math.floor(rect.height));
            if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
                canvas.width = w * dpr;
                canvas.height = h * dpr;
            }
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            return { w: w, h: h };
        }

        function updateVeracruzSubpanel(prefix, stateId, activeCityKey) {
            var subBox = document.getElementById(prefix + 'veracruzSubpanel');
            if (!subBox) return;

            if (stateId !== 'veracruz') {
                subBox.style.display = 'none';
                return;
            }
            subBox.style.display = 'block';

            var cards = subBox.querySelectorAll('[data-city-card]');
            cards.forEach(function (c) {
                var cKey = c.getAttribute('data-city-card');
                c.classList.toggle('active', cKey === activeCityKey);
            });

            var tabs = subBox.querySelectorAll('[data-city-tab]');
            tabs.forEach(function (t) {
                var tKey = t.getAttribute('data-city-tab');
                t.classList.toggle('active', tKey === activeCityKey);
            });

            ['minatitlan', 'coatzacoalcos'].forEach(function (cKey) {
                var city = VERACRUZ_CITIES_DATA[cKey];
                if (!city) return;
                var elY   = document.getElementById(prefix + 'city_' + cKey + '_year');
                var elM   = document.getElementById(prefix + 'city_' + cKey + '_month');
                var elH   = document.getElementById(prefix + 'city_' + cKey + '_head');
                var elA   = document.getElementById(prefix + 'city_' + cKey + '_area');
                var elCtx = document.getElementById(prefix + 'city_' + cKey + '_ctx');
                var elTag = document.getElementById(prefix + 'city_' + cKey + '_tag');

                if (elY)   elY.textContent   = city.co2Year;
                if (elM)   elM.textContent   = city.co2Month;
                if (elH)   elH.textContent   = city.cattleHead;
                if (elA)   elA.textContent   = city.pastureArea;
                if (elCtx) elCtx.textContent = city.context;
                if (elTag) elTag.textContent = '📌 ' + city.tag;
            });
        }

        /* Rellena los textos e indicadores de la tarjeta del estado y aplica el color 3D de acento */
        function populatePanelFields(prefix, stateId, animateNums) {
            var data = STATES_3D_DATA[stateId];
            if (!data) return;

            var stateCard  = document.getElementById(prefix + 'stateCard');
            var panelWrap  = stateCard ? stateCard.parentElement : null;
            var elName     = document.getElementById(prefix + 'scName');
            var elBadge    = document.getElementById(prefix + 'scBadge');
            var elCO2Year  = document.getElementById(prefix + 'scCO2Year');
            var elCO2Month = document.getElementById(prefix + 'scCO2Month');
            var elHead     = document.getElementById(prefix + 'scHead');
            var elLand     = document.getElementById(prefix + 'scLand');
            var elPct      = document.getElementById(prefix + 'scPct');
            var elMarker   = document.getElementById(prefix + 'scMarker');
            var elContext  = document.getElementById(prefix + 'scContext');

            /* Color dinámico del borde y halo 3D del panel según el estado seleccionado */
            if (panelWrap) {
                panelWrap.style.setProperty('--panel-accent', data.topColor);
            }

            if (elName)  elName.textContent = (data.isFeatured ? '★ ' : '📍 ') + data.name;
            if (elBadge) {
                elBadge.textContent = data.badgeText;
                elBadge.className   = 'state-card-badge ' + data.badgeClass;
            }

            if (animateNums) {
                animateDecimalValue(elCO2Year, data.co2Year, 2);
                animateDecimalValue(elCO2Month, data.co2Month, 2);
            } else {
                if (elCO2Year)  elCO2Year.textContent  = data.co2Year.toFixed(2);
                if (elCO2Month) elCO2Month.textContent = data.co2Month.toFixed(2);
            }

            if (elHead)    elHead.textContent    = data.headCount;
            if (elLand)    elLand.textContent    = data.landUse;
            if (elPct)     elPct.textContent     = data.pctNacional;
            if (elContext) elContext.textContent = data.context;
            if (elMarker)  elMarker.style.left   = 'calc(' + data.impactPct + '% - 10px)';

            updateVeracruzSubpanel(prefix, stateId, selectedCityId);
        }

        /* =================================================================
           TRANSICIONES 3D DEL PANEL FLOTANTE (ABRIR, CERRAR E INTERCAMBIAR)
           ================================================================= */
        function updateInfoPanel(stateId) {
            var prefix      = options.domPrefix || '';
            var placeholder = document.getElementById(prefix + 'infoPlaceholder');
            var stateCard   = document.getElementById(prefix + 'stateCard');
            var clearBtn    = document.getElementById(prefix + 'btnClearSel');
            var panelWrap   = stateCard ? stateCard.parentElement : null;

            if (options.pillsContainerId) {
                var pills = document.querySelectorAll('#' + options.pillsContainerId + ' [data-state-pill]');
                pills.forEach(function (btn) {
                    btn.classList.toggle('active', btn.getAttribute('data-state-pill') === stateId);
                });
            }

            if (clearBtn) {
                clearBtn.style.display = stateId ? 'inline-flex' : 'none';
            }

            if (swapTimer) {
                clearTimeout(swapTimer);
                swapTimer = null;
            }

            /* CASO 1: CERRAR PANEL EN 3D (Cuando se deselecciona un estado) */
            if (!stateId || !STATES_3D_DATA[stateId]) {
                if (panelWrap) panelWrap.style.setProperty('--panel-accent', 'rgba(74, 222, 128, 0.35)');

                if (stateCard && stateCard.classList.contains('visible') && lastRenderedId !== null) {
                    stateCard.classList.remove('anim-3d-open', 'anim-3d-swap-out', 'anim-3d-swap-in');
                    stateCard.classList.add('anim-3d-close');
                    lastRenderedId = null;

                    swapTimer = setTimeout(function () {
                        stateCard.classList.remove('visible', 'anim-3d-close');
                        updateVeracruzSubpanel(prefix, null, null);
                        if (placeholder) {
                            placeholder.style.display = 'block';
                            placeholder.classList.remove('anim-3d-open');
                            void placeholder.offsetWidth;
                            placeholder.classList.add('anim-3d-open');
                        }
                    }, 300);
                } else {
                    if (stateCard) stateCard.classList.remove('visible');
                    if (placeholder) placeholder.style.display = 'block';
                    lastRenderedId = null;
                }
                return;
            }

            /* CASO 2: ABRIR PANEL EN 3D (Estaba cerrado y se selecciona un estado) */
            if (!lastRenderedId || !stateCard.classList.contains('visible')) {
                if (placeholder) placeholder.style.display = 'none';
                populatePanelFields(prefix, stateId, false);
                stateCard.classList.remove('anim-3d-close', 'anim-3d-swap-out', 'anim-3d-swap-in', 'anim-3d-open');
                stateCard.classList.add('visible');
                void stateCard.offsetWidth; /* Forzar reflow para disparar animación 3D */
                stateCard.classList.add('anim-3d-open');
                if (panelWrap) {
                    panelWrap.classList.remove('shimmer-sweep');
                    void panelWrap.offsetWidth;
                    panelWrap.classList.add('shimmer-sweep');
                }
                lastRenderedId = stateId;
                return;
            }

            /* CASO 3: INTERCAMBIAR INFORMACIÓN EN 3D (Flip 3D de un estado a otro) */
            if (lastRenderedId !== stateId) {
                stateCard.classList.remove('anim-3d-open', 'anim-3d-close', 'anim-3d-swap-in');
                stateCard.classList.add('anim-3d-swap-out');

                if (panelWrap) {
                    panelWrap.classList.remove('shimmer-sweep');
                    void panelWrap.offsetWidth;
                    panelWrap.classList.add('shimmer-sweep');
                }

                swapTimer = setTimeout(function () {
                    populatePanelFields(prefix, stateId, true);
                    stateCard.classList.remove('anim-3d-swap-out');
                    void stateCard.offsetWidth;
                    stateCard.classList.add('anim-3d-swap-in');
                    lastRenderedId = stateId;
                }, 170);
                return;
            }

            /* CASO 4: Mismo estado (ej. cambio entre Minatitlán y Coatzacoalcos dentro de Veracruz) */
            populatePanelFields(prefix, stateId, false);
        }

        /* Efecto 3D Tilt Holográfico al mover el cursor sobre el panel flotante */
        (function initPanel3DTilt() {
            var prefix    = options.domPrefix || '';
            var stateCard = document.getElementById(prefix + 'stateCard');
            var panelWrap = stateCard ? stateCard.parentElement : null;
            if (!panelWrap) return;

            panelWrap.addEventListener('pointermove', function (e) {
                var r = panelWrap.getBoundingClientRect();
                var nx = ((e.clientX - r.left) / r.width) - 0.5;  /* -0.5 a 0.5 */
                var ny = ((e.clientY - r.top) / r.height) - 0.5;  /* -0.5 a 0.5 */
                var rotY = (nx * 7).toFixed(2) + 'deg';
                var rotX = (-ny * 6).toFixed(2) + 'deg';
                panelWrap.style.setProperty('--tilt-rot-x', rotX);
                panelWrap.style.setProperty('--tilt-rot-y', rotY);
            });

            panelWrap.addEventListener('pointerleave', function () {
                panelWrap.style.setProperty('--tilt-rot-x', '0deg');
                panelWrap.style.setProperty('--tilt-rot-y', '0deg');
            });
        })();

        function pickCityPinAt(mx, my) {
            for (var i = 0; i < cityScreenPts.length; i++) {
                var cp = cityScreenPts[i];
                if (Math.hypot(mx - cp.x, my - cp.y) <= 16) {
                    return cp.id;
                }
                if (cp.box &&
                    mx >= cp.box.x && mx <= cp.box.x + cp.box.w &&
                    my >= cp.box.y && my <= cp.box.y + cp.box.h) {
                    return cp.id;
                }
            }
            return null;
        }

        function pickStateAt(mx, my) {
            for (var i = focusPieces.length - 1; i >= 0; i--) {
                var piece = focusPieces[i];
                for (var r = 0; r < piece.screenPolys.length; r++) {
                    if (pointInRing(mx, my, piece.screenPolys[r])) {
                        return piece.id;
                    }
                }
            }
            return null;
        }

        var pointerDown = false;
        var dragMoved = false;
        var lastX = 0, lastY = 0;
        var mousePos = { x: 0, y: 0, inside: false };

        canvas.addEventListener('pointerdown', function (e) {
            if (e.button !== 0 && e.pointerType === 'mouse') return;
            pointerDown = true;
            dragMoved = false;
            lastX = e.clientX;
            lastY = e.clientY;
            canvas.setPointerCapture(e.pointerId);
        });

        canvas.addEventListener('pointermove', function (e) {
            var rect = canvas.getBoundingClientRect();
            var mx = e.clientX - rect.left;
            var my = e.clientY - rect.top;
            mousePos.x = mx;
            mousePos.y = my;
            mousePos.inside = true;

            if (pointerDown) {
                var dx = e.clientX - lastX;
                var dy = e.clientY - lastY;
                if (Math.hypot(dx, dy) > 4) dragMoved = true;
                if (dragMoved) {
                    cam.targetYaw   = Math.max(-0.95, Math.min(0.95, cam.targetYaw + dx * 0.006));
                    cam.targetPitch = Math.max(0.20, Math.min(0.88, cam.targetPitch - dy * 0.005));
                    lastX = e.clientX;
                    lastY = e.clientY;
                    canvas.style.cursor = 'grabbing';
                }
                return;
            }

            var cityHit = pickCityPinAt(mx, my);
            if (cityHit) {
                hoveredCityId = cityHit;
                hoveredId     = 'veracruz';
                canvas.style.cursor = 'pointer';
                return;
            }
            hoveredCityId = null;

            var hit = pickStateAt(mx, my);
            hoveredId = hit;
            canvas.style.cursor = hit ? 'pointer' : 'grab';
        });

        function handlePointerUp(e) {
            if (!pointerDown) return;
            pointerDown = false;
            var rect = canvas.getBoundingClientRect();
            var mx = e.clientX - rect.left;
            var my = e.clientY - rect.top;

            if (!dragMoved) {
                var cityHit = pickCityPinAt(mx, my);
                if (cityHit) {
                    selectedId     = 'veracruz';
                    selectedCityId = cityHit;
                    cityTwinkleBoost[cityHit] = 1.0;
                    updateInfoPanel('veracruz');
                    canvas.style.cursor = 'pointer';
                    return;
                }

                var hit = pickStateAt(mx, my);
                if (hit) {
                    selectedId = (selectedId === hit) ? null : hit;
                    updateInfoPanel(selectedId);
                }
            }
            canvas.style.cursor = (hoveredId || hoveredCityId) ? 'pointer' : 'grab';
        }

        canvas.addEventListener('pointerup', handlePointerUp);
        canvas.addEventListener('pointercancel', function () { pointerDown = false; });
        canvas.addEventListener('pointerleave', function () {
            mousePos.inside = false;
            if (!pointerDown) {
                hoveredId = null;
                hoveredCityId = null;
            }
        });

        canvas.addEventListener('wheel', function (e) {
            e.preventDefault();
            var factor = e.deltaY < 0 ? 1.08 : 0.92;
            cam.targetZoom = Math.max(0.75, Math.min(1.65, cam.targetZoom * factor));
        }, { passive: false });

        function renderLoop() {
            requestAnimationFrame(renderLoop);

            var dim = resizeCanvas();
            var w = dim.w, h = dim.h;
            var now = Date.now();

            if (cam.autoRotate && !pointerDown) {
                cam.targetYaw = Math.sin(now * 0.0008) * 0.42;
            }
            cam.yaw   += (cam.targetYaw   - cam.yaw)   * 0.14;
            cam.pitch += (cam.targetPitch - cam.pitch) * 0.14;
            cam.zoom  += (cam.targetZoom  - cam.zoom)  * 0.14;

            ctx.clearRect(0, 0, w, h);

            drawBasePlatform(w, h);

            contextPieces.forEach(function (cp) {
                drawExtrudedState(
                    cp.rings, 0, cp.baseH,
                    '#1e3a2f', '#0f241c', 'rgba(255,255,255,0.12)',
                    false, false, false, w, h
                );
            });

            var veracruzPiece = null;
            focusPieces.forEach(function (fp) {
                if (fp.id === 'veracruz') veracruzPiece = fp;
                var isSel    = (fp.id === selectedId);
                var isHover  = (fp.id === hoveredId);
                var baseRest = fp.info.isFeatured ? LIFT_FEATURED_BASE : 0;

                if (isSel && isHover) {
                    fp.targetLift = LIFT_SELECTED_HOVER;
                } else if (isSel) {
                    fp.targetLift = LIFT_SELECTED;
                } else if (isHover) {
                    fp.targetLift = LIFT_HOVER;
                } else {
                    fp.targetLift = baseRest;
                }

                fp.currentLift += (fp.targetLift - fp.currentLift) * 0.16;

                var cProj = project3D(fp.center.x, fp.center.y, 0, w, h);
                fp.depthKey = cProj.y;
            });

            focusPieces.sort(function (a, b) {
                var aHigh = (a.id === selectedId || a.id === hoveredId) ? 1 : 0;
                var bHigh = (b.id === selectedId || b.id === hoveredId) ? 1 : 0;
                if (aHigh !== bHigh) return aHigh - bHigh;
                return a.depthKey - b.depthKey;
            });

            focusPieces.forEach(function (fp) {
                var isHover = (fp.id === hoveredId);
                var isSel   = (fp.id === selectedId);
                var zBottom = fp.currentLift * 0.48;
                var zTop    = fp.baseH + fp.currentLift;

                fp.screenPolys = drawExtrudedState(
                    fp.rings,
                    zBottom,
                    zTop,
                    fp.info.topColor,
                    fp.info.sideColor,
                    fp.info.strokeColor,
                    isHover,
                    isSel,
                    !!fp.info.isFeatured,
                    w, h
                );

                var off = fp.info.labelOffset || [0, 0];
                fp.labelScreen = project3D(fp.center.x + off[0], fp.center.y + off[1], zTop + 6, w, h);
            });

            focusPieces.forEach(function (fp) {
                var isHover = (fp.id === hoveredId);
                var isSel   = (fp.id === selectedId);
                var isFeat  = !!fp.info.isFeatured;
                var lp      = fp.labelScreen;

                if (isHover || isSel || isFeat) {
                    var basePt = project3D(fp.center.x, fp.center.y, fp.baseH + fp.currentLift, w, h);
                    ctx.beginPath();
                    ctx.moveTo(basePt.x, basePt.y);
                    ctx.lineTo(lp.x, lp.y - 9);
                    ctx.strokeStyle = isFeat ? '#fde047' : (isSel ? '#4ade80' : 'rgba(255,255,255,0.75)');
                    ctx.lineWidth = (isSel || isFeat) ? 2.0 : 1.4;
                    ctx.stroke();
                }

                var labelText = fp.info.shortName || fp.info.name;
                ctx.font = (isSel || isHover || isFeat ? '800 11.5px ' : '700 10px ') + 'Inter, system-ui, sans-serif';
                var textW = ctx.measureText(labelText).width;
                var boxW  = textW + 14;
                var boxH  = (isSel || isHover || isFeat) ? 22 : 18;
                var bx    = lp.x - boxW * 0.5;
                var by    = lp.y - boxH * 0.5 - (isSel || isHover ? 7 : 0);

                ctx.fillStyle = isFeat
                    ? 'rgba(127, 29, 29, 0.96)'
                    : (isSel ? 'rgba(20, 83, 45, 0.96)' : (isHover ? 'rgba(15, 23, 42, 0.94)' : 'rgba(15, 23, 42, 0.76)'));
                ctx.strokeStyle = isFeat ? '#fde047' : (isSel ? '#4ade80' : (isHover ? '#ffffff' : 'rgba(255,255,255,0.32)'));
                ctx.lineWidth   = (isSel || isFeat) ? 1.9 : 1;

                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(bx, by, boxW, boxH, 5);
                else ctx.rect(bx, by, boxW, boxH);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = isFeat ? '#fef08a' : '#ffffff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(labelText, lp.x, by + boxH * 0.5);
            });

            /* 6. Puntos brillantes con tintineo de Minatitlán y Coatzacoalcos */
            cityScreenPts = [];
            if (veracruzPiece) {
                var verZTop = veracruzPiece.baseH + veracruzPiece.currentLift;

                ['minatitlan', 'coatzacoalcos'].forEach(function (cKey) {
                    var city = VERACRUZ_CITIES_DATA[cKey];
                    var basePt = project3D(city.mapCoords.x, city.mapCoords.y, verZTop, w, h);
                    var pinTop = project3D(city.mapCoords.x, city.mapCoords.y, verZTop + 17, w, h);
                    var isCityActive = (selectedId === 'veracruz' && selectedCityId === cKey) || (hoveredCityId === cKey);

                    if (cityTwinkleBoost[cKey] > 0.01) {
                        cityTwinkleBoost[cKey] *= 0.94;
                    } else {
                        cityTwinkleBoost[cKey] = 0;
                    }
                    var boost = cityTwinkleBoost[cKey];

                    var tWave1 = 0.5 + 0.5 * Math.sin(now * 0.008 + city.phaseOffset);
                    var tWave2 = 0.5 + 0.5 * Math.cos(now * 0.019 + city.phaseOffset * 1.7);
                    var twinkle = 0.35 + 0.65 * (tWave1 * 0.65 + tWave2 * 0.35);

                    var ringRadius = (isCityActive ? 6 : 4) + tWave1 * (isCityActive ? 7 : 4.5) + boost * 10;
                    ctx.beginPath();
                    ctx.arc(basePt.x, basePt.y, ringRadius, 0, Math.PI * 2);
                    ctx.fillStyle = isCityActive
                        ? 'rgba(254, 240, 138, ' + (0.38 * twinkle).toFixed(2) + ')'
                        : 'rgba(253, 224, 71, ' + (0.24 * twinkle).toFixed(2) + ')';
                    ctx.fill();

                    ctx.beginPath();
                    ctx.moveTo(basePt.x, basePt.y);
                    ctx.lineTo(pinTop.x, pinTop.y);
                    ctx.strokeStyle = isCityActive ? '#ffffff' : '#fde047';
                    ctx.lineWidth = isCityActive ? 2.4 : 1.7;
                    ctx.stroke();

                    var glowR = (isCityActive ? 16 : 11) + twinkle * 6 + boost * 12;
                    var radGrad = ctx.createRadialGradient(pinTop.x, pinTop.y, 1, pinTop.x, pinTop.y, glowR);
                    radGrad.addColorStop(0, 'rgba(255, 255, 255, ' + Math.min(1, 0.75 + boost * 0.25) + ')');
                    radGrad.addColorStop(0.35, isCityActive ? 'rgba(253, 224, 71, 0.85)' : 'rgba(250, 204, 21, 0.65)');
                    radGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
                    ctx.beginPath();
                    ctx.arc(pinTop.x, pinTop.y, glowR, 0, Math.PI * 2);
                    ctx.fillStyle = radGrad;
                    ctx.fill();

                    var starOuter = (isCityActive ? 12 : 8.5) * (0.7 + 0.55 * tWave2) + boost * 9;
                    drawTwinkleStar(ctx, pinTop.x, pinTop.y, starOuter, starOuter * 0.26, 0.55 + 0.45 * twinkle, '#fef08a');

                    ctx.beginPath();
                    ctx.arc(pinTop.x, pinTop.y, isCityActive ? 5.2 : 4.2, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();
                    ctx.strokeStyle = '#f59e0b';
                    ctx.lineWidth = 1.6;
                    ctx.stroke();

                    var cLabel = (isCityActive ? '✦ ' : '• ') + city.name;
                    ctx.font = (isCityActive ? '800 11px ' : '700 10px ') + 'Inter, system-ui, sans-serif';
                    var cw = ctx.measureText(cLabel).width + 12;
                    var ch = 18;
                    var bx = cKey === 'minatitlan' ? (pinTop.x - cw - 8) : (pinTop.x + 10);
                    var by = cKey === 'minatitlan' ? (pinTop.y + 4)       : (pinTop.y - ch - 4);

                    ctx.fillStyle = isCityActive ? 'rgba(127, 29, 29, 0.96)' : 'rgba(15, 23, 42, 0.92)';
                    ctx.strokeStyle = isCityActive ? '#fde047' : 'rgba(253, 224, 71, 0.65)';
                    ctx.lineWidth = isCityActive ? 1.8 : 1.1;

                    ctx.beginPath();
                    if (ctx.roundRect) ctx.roundRect(bx, by, cw, ch, 4);
                    else ctx.rect(bx, by, cw, ch);
                    ctx.fill();
                    ctx.stroke();

                    ctx.fillStyle = isCityActive ? '#ffffff' : '#fef08a';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(cLabel, bx + cw * 0.5, by + ch * 0.5);

                    cityScreenPts.push({
                        id: cKey,
                        x: pinTop.x,
                        y: pinTop.y,
                        box: { x: bx, y: by, w: cw, h: ch }
                    });
                });
            }

            if (hoveredCityId && mousePos.inside && !pointerDown) {
                var cInfo = VERACRUZ_CITIES_DATA[hoveredCityId];
                var cTitle = '✦ ' + cInfo.name + ' (Sur de Veracruz)';
                var cSub   = 'GEI: ' + cInfo.co2Year + ' · Clic para resaltar información';
                ctx.font = '700 12px Inter, system-ui, sans-serif';
                var ctw = Math.max(ctx.measureText(cTitle).width, ctx.measureText(cSub).width) + 24;
                var cth = 46;
                var ctxX = Math.min(w - ctw - 12, Math.max(12, mousePos.x + 16));
                var ctxY = Math.max(12, mousePos.y - cth - 12);

                ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
                ctx.strokeStyle = '#fde047';
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(ctxX, ctxY, ctw, cth, 8);
                else ctx.rect(ctxX, ctxY, ctw, cth);
                ctx.fill();
                ctx.stroke();

                ctx.textAlign = 'left';
                ctx.fillStyle = '#fde047';
                ctx.font = '700 12px Inter, system-ui, sans-serif';
                ctx.fillText(cTitle, ctxX + 12, ctxY + 16);

                ctx.fillStyle = '#e2e8f0';
                ctx.font = '500 11px Inter, system-ui, sans-serif';
                ctx.fillText(cSub, ctxX + 12, ctxY + 33);
            } else if (hoveredId && mousePos.inside && !pointerDown) {
                var hInfo = STATES_3D_DATA[hoveredId];
                var isAlreadySel = (hoveredId === selectedId);
                var tipTitle = (hInfo.isFeatured ? '★ ' : '') + hInfo.name + ' · ' + hInfo.badgeText;
                var tipSub   = 'GEI: ' + hInfo.co2Year.toFixed(2) + ' Mt/año (' + hInfo.co2Month.toFixed(2) + ' Mt/mes) · ' +
                               (isAlreadySel ? 'Clic para cerrar panel 3D' : 'Clic para abrir en panel 3D');
                ctx.font = '700 12px Inter, system-ui, sans-serif';
                var tw = Math.max(ctx.measureText(tipTitle).width, ctx.measureText(tipSub).width) + 24;
                var th = 46;
                var tx = Math.min(w - tw - 12, Math.max(12, mousePos.x + 16));
                var ty = Math.max(12, mousePos.y - th - 12);

                ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
                ctx.strokeStyle = hInfo.isFeatured ? '#fde047' : '#4ade80';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(tx, ty, tw, th, 8);
                else ctx.rect(tx, ty, tw, th);
                ctx.fill();
                ctx.stroke();

                ctx.textAlign = 'left';
                ctx.fillStyle = hInfo.isFeatured ? '#fde047' : '#4ade80';
                ctx.font = '700 12px Inter, system-ui, sans-serif';
                ctx.fillText(tipTitle, tx + 12, ty + 16);

                ctx.fillStyle = '#e2e8f0';
                ctx.font = '500 11px Inter, system-ui, sans-serif';
                ctx.fillText(tipSub, tx + 12, ty + 33);
            }
        }

        if (options.pillsContainerId) {
            var pills = document.querySelectorAll('#' + options.pillsContainerId + ' [data-state-pill]');
            pills.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var stId = this.getAttribute('data-state-pill');
                    selectedId = (selectedId === stId) ? null : stId;
                    updateInfoPanel(selectedId);
                });
            });
        }

        var prefix = options.domPrefix || '';
        var clearBtn = document.getElementById(prefix + 'btnClearSel');
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                selectedId = null;
                updateInfoPanel(null);
            });
        }

        /* Botón ✕ dentro de la esquina superior del panel flotante 3D */
        var closeCardBtn = document.getElementById(prefix + 'btnCloseCard3D');
        if (closeCardBtn) {
            closeCardBtn.addEventListener('click', function () {
                selectedId = null;
                updateInfoPanel(null);
            });
        }

        var subBox = document.getElementById(prefix + 'veracruzSubpanel');
        if (subBox) {
            subBox.querySelectorAll('[data-city-tab], [data-city-card]').forEach(function (el) {
                el.addEventListener('click', function () {
                    var cKey = this.getAttribute('data-city-tab') || this.getAttribute('data-city-card');
                    if (cKey && VERACRUZ_CITIES_DATA[cKey]) {
                        selectedId     = 'veracruz';
                        selectedCityId = cKey;
                        cityTwinkleBoost[cKey] = 1.0;
                        updateInfoPanel('veracruz');
                    }
                });
            });
        }

        updateInfoPanel(selectedId);
        renderLoop();

        return {
            selectState: function (id) {
                selectedId = (id && STATES_3D_DATA[id]) ? id : null;
                updateInfoPanel(selectedId);
            },
            selectCity: function (cityKey) {
                if (VERACRUZ_CITIES_DATA[cityKey]) {
                    selectedId     = 'veracruz';
                    selectedCityId = cityKey;
                    cityTwinkleBoost[cityKey] = 1.0;
                    updateInfoPanel('veracruz');
                }
            },
            clearSelection: function () {
                selectedId = null;
                updateInfoPanel(null);
            },
            setIsometric3D: function () {
                cam.autoRotate = false;
                cam.targetYaw = -0.14;
                cam.targetPitch = 0.62;
                cam.targetZoom = 1.02;
            },
            setTopView: function () {
                cam.autoRotate = false;
                cam.targetYaw = 0;
                cam.targetPitch = 0.22;
                cam.targetZoom = 1.0;
            },
            toggleAutoRotate: function () {
                cam.autoRotate = !cam.autoRotate;
                return cam.autoRotate;
            },
            zoomIn: function () {
                cam.targetZoom = Math.min(1.65, cam.targetZoom * 1.15);
            },
            zoomOut: function () {
                cam.targetZoom = Math.max(0.75, cam.targetZoom * 0.87);
            }
        };
    }

    window.createMapa3D = createMapa3D;
})();
