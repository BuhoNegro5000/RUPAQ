# RUPAQ — design brief

**Encargo:** un asistente de calor extremo para Perú, mobile-first, PWA, sin login y sin publicidad. Hecho por Green Owl Labs.

## 1. La idea de diseño

Rupaq no se abre como una página del clima: se abre como **una ventana al cielo del día**. El fondo no es decoración; es la lectura más rápida del riesgo. La temperatura es el dato protagonista, pero la decisión es la frase que viene debajo.

La interfaz se apoya en tres gestos:

1. **Cielo, no tarjeta.** Un campo cálido de papel que cambia de luz con la hora y el riesgo. Sin cajas apiladas, sin cristal, sin sombras.
2. **Instrumento editorial.** Números enormes en Bricolage Grotesque, cuerpo en Figtree, líneas de 1 px y mucho aire. La jerarquía se construye con escala y peso, no con contenedores.
3. **Una acción por vez.** La pantalla Hoy tiene un solo consejo grande. Las guías de salud tienen una instrucción por pantalla. El resto de los datos baja de volumen.

**Promesa emocional:** “Alguien pensó en mí y en mi familia, no en impresionar a un jurado”.

## 2. Tipografía

- **Bricolage Grotesque** para temperatura, titulares y cifras. Tiene una irregularidad humanista y una apertura óptica que evita el look corporativo de Inter/Roboto. En tamaños grandes la temperatura se vuelve un objeto gráfico, no un widget.
- **Figtree** para cuerpo y UI. Alta legibilidad en pantallas pequeñas y en español, con una calidez geométrica que conversa con el papel.
- **Escala:** cuerpo 18 px; secundario 16 px (excepcionalmente 15 px en metadatos); navegación 14 px; display 24–160 px. Nada por debajo de 14 px. Cifras tabulares.
- **Autohospedadas:** solo subsets latin, en `/fonts`. Sin Google Fonts en runtime. Total 61 KB.

## 3. Color y riesgo

Cinco niveles con color, palabra y patrón. Ningún nivel depende solo del color.

| Nivel | Color de marca | Tinta accesible | Patrón |
| --- | --- | --- | --- |
| Seguro | `#7D9A5B` | `#34461F` | sólido |
| Atención | `#D9A441` | `#674405` | sólido |
| Precaución | `#E0762B` | `#732B04` | sólido |
| Peligro | `#8F1D12` | `#5E0F09` | diagonal `/` densa |
| Extremo | `#4B1024` (vino profundo) | `#3A0712` | retícula `×` + puntos |

El cielo de riesgo alto respeta la indicación: `#F4CF93 → #F2B77E` y vuelve a papel. El modo oscuro no es negro: es ocre ceniza, con cielo vino apagado en riesgo extremo.

La temperatura, la frase y las guías usan tinta marrón (`#2B1608`), no negro puro. En fondos cálidos se verifica AA/AAA; el texto crítico se lleva a AAA. El riesgo siempre se acompaña de palabra y patrón. Los colores de nivel se usan como acento en la tinta oscura, no como texto sobre color saturado.

## 4. Estructura

- **Shell de app:** 100dvh, safe areas, sin scroll de página. El scroll vive en el contenido que lo necesita.
- **Móvil:** 4 pestañas fijas. Hoy cabe completa en 390 × 844. Emergencia se muestra como píldora oscura persistente sobre la barra.
- **≥ 768 px:** riel lateral con marca y navegación; Hoy en dos columnas: decisión a la izquierda, arco y semana a la derecha. Ancho de lectura máximo 1320 px.
- **Transiciones:** View Transitions API, entradas escalonadas de 40 ms, arco que se dibuja en 900 ms. `prefers-reduced-motion` elimina todo lo no esencial.
- **Solo una caja destacada:** el triage/emergencia. El resto son hairlines.

## 5. Datos y confianza

- Fuente meteorológica primaria: Open-Meteo (CC BY 4.0), a través de un adaptador de servidor. Avisos oficiales: adaptador SENAMHI opcional por feed autorizado; si no hay feed activo, se declara.
- El cálculo de sensación térmica usa Rothfusz (NWS) con humedad horaria y el ajuste simple de Steadman bajo 26.7 °C. WBGT queda preparado para modo trabajador.
- Umbrales por zona climática en JSON versionado. Contenido con `revisado_por` y `fecha_revision`; revisión médica marcada como pendiente mientras no exista acta.
- Frescura visible: “Actualizado hace X min”. Si la red cae, se sirve la última predicción válida y se dice.

## 6. Lo que este diseño evita deliberadamente

Sin login, sin menú escondido, sin tarjetas flotantes, sin grillas de iconos de colores, sin glassmorphism, sin un segundo titular compitiendo con la temperatura, sin scroll en Hoy, sin alarmismo. La app orienta; no diagnostica.
