/* ==================================================================
   DATOS DE LOS ESTADOS  (EDITABLE)
   ------------------------------------------------------------------
   IMPORTANTE: son VALORES DE REFERENCIA / ESTIMACIÓN para el prototipo.
   No son mediciones oficiales ni certificadas. Reemplázalos por cifras
   citables (SIAP, INECC, SEMARNAT, INEGI) antes de una entrega formal.

   Campos:
     name       Nombre mostrado
     nivel      "critico" | "alto" | "medio" | "moderado" | "bajo"
     gei_anual  Emisiones GEI estimadas al año (Mt CO2eq = millones de toneladas)
     cabezas    Cabezas de ganado bovino aprox.
     superficie Superficie ganadera aprox. (miles de hectáreas)
     contexto   Texto breve sobre ganadería / suelos / impacto
   El valor MENSUAL se calcula en main.js como gei_anual / 12.
   ================================================================== */
window.DATOS_ESTADOS = {
  veracruz: {
    name: 'Veracruz', nivel: 'critico',
    gei_anual: 8.2, cabezas: 4200000, superficie: 3850,
    contexto: 'Mayor inventario bovino del país. La expansión ganadera ha sustituido selvas y bosques mesófilos por pastizales, y los desechos pecuarios presionan cuencas como Papaloapan y Coatzacoalcos.'
  },
  chiapas: {
    name: 'Chiapas', nivel: 'critico',
    gei_anual: 6.5, cabezas: 3100000, superficie: 3200,
    contexto: 'Alta tasa de cambio de uso de suelo forestal a pastizal, incluyendo zonas cercanas a la Selva Lacandona. Se pierden sumideros de carbono y hábitat de especies endémicas.'
  },
  tabasco: {
    name: 'Tabasco', nivel: 'alto',
    gei_anual: 3.8, cabezas: 1850000, superficie: 1420,
    contexto: 'Humedales y selvas transformados en pastizales de llanura húmeda. La ganadería presiona el sistema Grijalva-Usumacinta y los manglares costeros.'
  },
  oaxaca: {
    name: 'Oaxaca', nivel: 'medio',
    gei_anual: 2.4, cabezas: 1400000, superficie: 1650,
    contexto: 'Ganadería de escala media con prácticas tradicionales e intensivas. Hay degradación de suelos y pérdida de vegetación nativa en el Istmo y la Sierra Sur.'
  },
  campeche: {
    name: 'Campeche', nivel: 'bajo',
    gei_anual: 1.1, cabezas: 480000, superficie: 680,
    contexto: 'Ganadería moderada. El riesgo principal es la fragmentación de selva (zona de Calakmul) donde el pastoreo colinda con áreas naturales protegidas.'
  },
  yucatan: {
    name: 'Yucatán', nivel: 'bajo',
    gei_anual: 1.3, cabezas: 520000, superficie: 750,
    contexto: 'Menor presión bovina, pero la producción porcícola y avícola intensiva amenaza los acuíferos kársticos. La selva baja pierde terreno por agricultura mecanizada.'
  },
  quintanaroo: {
    name: 'Quintana Roo', nivel: 'moderado',
    gei_anual: 0.8, cabezas: 180000, superficie: 320,
    contexto: 'Ganadería relativamente baja y concentrada en el sur, donde presiona la selva. La mayor presión ambiental del estado proviene del desarrollo turístico costero.'
  }
};

/* Escala de color por nivel: del azul (bajo) al rojo intenso (crítico) */
window.NIVELES = {
  bajo:     { etiqueta: 'Impacto bajo',     color: 0x2563eb, css: '#2563eb', escala: 15 },
  moderado: { etiqueta: 'Impacto moderado', color: 0x06b6d4, css: '#06b6d4', escala: 35 },
  medio:    { etiqueta: 'Impacto medio',    color: 0xeab308, css: '#eab308', escala: 55 },
  alto:     { etiqueta: 'Impacto alto',     color: 0xf97316, css: '#f97316', escala: 75 },
  critico:  { etiqueta: 'Impacto crítico',  color: 0xdc2626, css: '#dc2626', escala: 95 }
};

