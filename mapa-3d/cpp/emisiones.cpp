// ====================================================================
// emisiones.cpp — Módulo de cálculo de emisiones (EJEMPLO / PROTOTIPO)
// --------------------------------------------------------------------
// Este archivo NO se ejecuta dentro del navegador ni lo usa el mapa 3D
// directamente. El mapa corre solo con HTML + CSS + JavaScript.
//
// Para qué sirve:
//   * Documentar la lógica de cálculo (la misma que usa main.js).
//   * Servir de base si luego se compila a WebAssembly con Emscripten.
//
// Compilar como programa de consola (g++):
//   g++ -std=c++17 -O2 cpp/emisiones.cpp -o emisiones
//   ./emisiones            (en Windows: emisiones.exe)
//
// Compilar a WebAssembly (requiere Emscripten instalado):
//   emcc cpp/emisiones.cpp -O2 -s MODULARIZE=1 -s EXPORT_NAME=Emisiones \
//        -s EXPORTED_FUNCTIONS=_gei_mensual,_gei_por_cabeza,_proyeccion \
//        -o js/emisiones.js
//   (Ese .js/.wasm se cargaría desde JavaScript; no está conectado aún.)
//
// Los valores son estimaciones de referencia, no mediciones oficiales.
// ====================================================================
#include <cstdio>

extern "C" {

// Emisiones mensuales (Mt CO2eq) a partir de las anuales.
double gei_mensual(double gei_anual_mt) {
    return gei_anual_mt / 12.0;
}

// Emisiones por cabeza de ganado al año (toneladas CO2eq por cabeza).
// 1 Mt = 1,000,000 toneladas.
double gei_por_cabeza(double gei_anual_mt, double cabezas) {
    if (cabezas <= 0.0) return 0.0;
    return (gei_anual_mt * 1000000.0) / cabezas;
}

// Proyección simple a N años con crecimiento anual porcentual constante.
// Ejemplo: proyeccion(8.2, 2.0, 5) -> emisiones esperadas en 5 años.
double proyeccion(double gei_anual_mt, double crecimiento_pct, int anios) {
    double valor = gei_anual_mt;
    for (int i = 0; i < anios; ++i) valor *= (1.0 + crecimiento_pct / 100.0);
    return valor;
}

} // extern "C"

// Programa de prueba: imprime una tabla con datos de ejemplo.
int main() {
    struct Estado { const char* nombre; double gei; double cabezas; };
    const Estado estados[] = {
        {"Veracruz", 8.2, 4200000}, {"Chiapas", 6.5, 3100000},
        {"Tabasco", 3.8, 1850000},  {"Oaxaca", 2.4, 1400000},
        {"Campeche", 1.1, 480000},  {"Yucatan", 1.3, 520000},
        {"Quintana Roo", 0.8, 180000}
    };
    std::printf("%-14s %10s %10s %14s %12s\n",
                "Estado", "Mt/anio", "Mt/mes", "t/cabeza/anio", "Mt en 5 anios");
    for (const Estado& e : estados) {
        std::printf("%-14s %10.2f %10.2f %14.2f %12.2f\n", e.nombre, e.gei,
                    gei_mensual(e.gei), gei_por_cabeza(e.gei, e.cabezas),
                    proyeccion(e.gei, 2.0, 5));
    }
    return 0;
}

