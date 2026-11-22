# Mapa 3D — Sur y Sureste de México

Mapa 3D interactivo (Three.js) sobre ganadería, uso de suelo y gases de efecto invernadero.

## Estructura

```
mapa-3d/
├─ index.html            Página (carga Three.js por CDN)
├─ styles.css            Estilos responsive
├─ main.js               Escena 3D, hover, clic y panel
├─ js/
│  ├─ datos-estados.js   ★ Datos EDITABLES (estimaciones de referencia)
│  └─ geo-estados.js     Geometría generada (no editar a mano)
├─ scripts/build-geo.ps1 Regenera geo-estados.js desde ../mexico.geojson
└─ cpp/emisiones.cpp     Módulo de cálculo en C++ (aparte del navegador)
```

## Cómo abrirlo

- **Live Server (recomendado):** en VS Code, clic derecho en `index.html` → *Open with Live Server*.
- **Directo:** doble clic en `index.html` (funciona sin servidor; requiere internet para el CDN de Three.js).

## Uso

- Pasar el cursor: el estado se eleva y se ilumina (los demás no se mueven).
- Clic izquierdo: abre el panel con GEI mensual/anual, cabezas, superficie y contexto.
- Arrastrar: girar · Rueda o pellizco: zoom · `Esc` o ✕: cerrar panel.

## Editar datos

Cambia los valores en `js/datos-estados.js`. El valor mensual se calcula como anual ÷ 12.
Las cifras son **estimaciones de referencia para el prototipo**, no mediciones oficiales.

## C++

`cpp/emisiones.cpp` **no se ejecuta en el navegador**. El mapa funciona solo con HTML/CSS/JS.
El C++ documenta la lógica de cálculo y puede compilarse a WebAssembly con Emscripten
(instrucciones en el encabezado del archivo).

