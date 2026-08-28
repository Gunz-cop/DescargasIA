# Evidencia — exports de Google Search Console del 2026-08-28

> Ingesta del issue [#50](https://github.com/Gunz-cop/DescargasIA/issues/50).
> Entregados por el propietario de la propiedad en el comentario del
> 2026-08-28. Este directorio conserva una **versión derivada** de los CSV que
> venían dentro de los adjuntos: mismos valores, sin transformar, con los
> nombres normalizados a ASCII. **Los ZIP originales no se versionan.**

Todo lo que hay aquí es Google Search Console. **No hay datos de Bing** en esta
carpeta ni en los adjuntos originales.

## Procedencia y trazabilidad

Archivos tal como se publicaron en #50, y SHA-256 de la copia descargada el
2026-08-28 desde el adjunto del issue:

| Adjunto original | SHA-256 del archivo descargado |
|---|---|
| `fuenteai.com-Performance-on-Search-2026-08-28.zip` | `c1dd68f733e0de6ed1ab45b797c3272a0e293410a44021d9f1f9ee307b43bcb4` |
| `fuenteai.com-Coverage-2026-08-28.zip` | `ae2b07b480570c2fc80b137a10db5c73c37e844be669b35609938cc0aa6bd6c4` |
| `fuenteai.com-Coverage-Valid-2026-08-28.zip` | `b8444eac74d6fb308596400f9f4f1257f2f5d2e643e000dd6e5989f392f3cd36` |
| `fuenteai.com-Latest.links-2026-08-28.csv` | `75cafe690c8e21c002d9b5918bc4e1e8598d46cdd7f7cc62de6e079ffc4c21fb` |

Los CSV internos llevan marca de tiempo `2026-08-28 11:26`–`11:27` dentro de
los ZIP.

## Qué archivo deriva de qué

| Archivo de este directorio | Origen exacto | Filas de datos |
|---|---|---|
| `rendimiento-serie-diaria.csv` | Performance → `Gráfico.csv` | 69 |
| `rendimiento-consultas.csv` | Performance → `Consultas.csv` | 920 |
| `rendimiento-paginas.csv` | Performance → `Páginas.csv` | 135 |
| `rendimiento-paises.csv` | Performance → `Países.csv` | 87 |
| `rendimiento-dispositivos.csv` | Performance → `Dispositivos.csv` | 3 |
| `cobertura-serie-diaria.csv` | Coverage → `Gráfico.csv` | 64 |
| `cobertura-motivos-no-indexado.csv` | Coverage → `Problemas críticos.csv` | 6 |
| `cobertura-validas-serie-diaria.csv` | Coverage-Valid → `Gráfico.csv` | 53 |
| `cobertura-validas-urls.csv` | Coverage-Valid → `Tabla.csv` | 160 |

Única transformación aplicada: renombrado del archivo y, donde faltaba, salto
de línea final. **No se ha reordenado, redondeado, filtrado ni recalculado
ninguna celda.** Nueve filas de `rendimiento-consultas.csv` contienen saltos de
línea dentro del campo de consulta, tal como los exportó Search Console; el
archivo tiene 920 registros CSV aunque `wc -l` cuente más líneas.

### Archivos del export que **no** se versionan porque vienen vacíos

| Archivo | Estado real |
|---|---|
| Performance → `Aparición en búsquedas.csv` | Solo cabecera. Sin filas de aparición en búsquedas |
| Coverage → `Problemas no críticos.csv` | Solo cabecera. Ningún problema no crítico |
| `fuenteai.com-Latest.links-2026-08-28.csv` | Solo cabecera (`Página con enlaces,Último rastreo`). **Cero enlaces registrados**; no aporta evidencia de enlazado externo |

`Metadatos.csv` de ambos ZIP de cobertura contiene únicamente
`Propiedad,Valor` / `Sitemap,Todas las páginas conocidas`. No se versiona por
no aportar dato adicional.

## Alcance del corte, leído del propio export

| Campo | Valor tal como aparece en el export |
|---|---|
| Propiedad | `fuenteai.com` (por las URLs del export; no expone identificador de cuenta) |
| Tipo de búsqueda | `Web` (`Filtros.csv`) |
| Etiqueta de fecha | `Últimos 3 meses` (`Filtros.csv`) |
| Periodo real de la serie de rendimiento | **2026-06-19 a 2026-08-26**, 69 días consecutivos |
| Periodo de la serie de cobertura | 2026-06-18 a 2026-08-20, 64 días |
| Periodo de la serie de páginas válidas | 2026-06-29 a 2026-08-20, 53 días |
| Filtro de página | **Ninguno.** El corte es de propiedad completa, no de `/es/*` |
| Filtro de consulta | Ninguno |
| Filtro de país | Ninguno |
| Filtro de dispositivo | Ninguno |
| Filtro de apariencia en búsquedas | Ninguno |
| Sitemap (cobertura) | `Todas las páginas conocidas` |

## Totales verificables

Todos los números de esta sección salen de sumar los CSV de este directorio.

| Medida | Valor |
|---|---|
| Clics del periodo (serie diaria) | **47** |
| Impresiones del periodo (serie diaria) | **6.531** |
| Último día con dato de rendimiento | 2026-08-26 (3 clics, 493 impresiones) |
| URLs indexadas el 2026-08-20 | **160** |
| URLs no indexadas el 2026-08-20 | **90** |
| URLs de la tabla de páginas válidas | 160 (`es` 81 · `sv` 43 · `it` 34 · raíz 2) |
| Rango de «último rastreo» de esas URLs | 2026-07-07 a 2026-08-21 |

Reparto de impresiones de la tabla de páginas por prefijo de ruta:

| Prefijo | Impresiones | Clics | URLs |
|---|---|---|---|
| `/es/*` | 6.097 | 41 | 86 |
| `/sv/*` | 290 | 2 | — |
| `/it/*` | 58 | 0 | — |
| Raíz e índices sin prefijo de idioma | 168 | 4 | — |

Motivos de no indexación (Coverage, `Problemas críticos.csv`):

| Motivo | Fuente | Páginas |
|---|---|---|
| Excluida por una etiqueta `noindex` | Sitio web | 52 |
| Descubierta: actualmente sin indexar | Sistemas de Google | 15 |
| Página alternativa con etiqueta canónica adecuada | Sitio web | 8 |
| Rastreada: actualmente sin indexar | Sistemas de Google | 8 |
| Página con redirección | Sitio web | 4 |
| Error de redirección | Sitio web | 3 |

## Límites de este export — leer antes de usarlo

Estas restricciones no son cautela editorial: son propiedades del archivo.

1. **Las tablas son agregados por dimensión, no un cubo cruzado.** Hay
   consultas y hay páginas, pero **no hay consulta × página**, ni consulta ×
   país, ni página × fecha, ni página × dispositivo. Ninguna consulta de
   `rendimiento-consultas.csv` puede atribuirse a una URL concreta, `/es/*`
   incluida.
2. **La tabla de consultas está truncada y anonimizada.** Sus 920 filas suman
   3.618 impresiones y 13 clics, frente a las 6.531 impresiones y 47 clics de
   la propiedad: falta el **44,6 %** de las impresiones y 34 de los 47 clics.
   Search Console omite consultas de bajo volumen por privacidad y limita la
   tabla a 1.000 filas. No se puede sumar la tabla y llamarlo «total», ni
   deducir lo que falta.
3. **Las impresiones por página suman más que la serie diaria** (6.582 frente a
   6.531). Es el comportamiento habitual de Search Console cuando una misma
   impresión implica más de una URL del sitio. Se conservan ambos números como
   están; no se reconcilian ni se corrige uno con el otro.
4. **La tendencia solo existe a nivel de propiedad.** La serie diaria no está
   desglosada por página, consulta ni país, así que **ninguna página concreta
   tiene tendencia demostrable** con este archivo.
5. **Los países no están cruzados con nada.** España encabeza la tabla con
   1.879 impresiones y 15 clics, pero eso es de la propiedad completa, que
   incluye `sv` e `it`. No demuestra el país de las visitas a `/es/*`.
6. **La posición media es una media.** No es la posición que ve un usuario
   concreto, y mezcla países y dispositivos.
7. **Cobertura no es demanda.** Una URL indexada no implica tráfico, y una no
   indexada por `noindex` puede ser deliberada.
8. **El export no cubre `/r`.** Search Console mide la SERP de Google, no el
   recorrido interno ni la salida al canal oficial. Eso es F1 y Cloudflare.

## Datos personales

Revisadas las 920 consultas antes de versionarlas: no contienen correos,
identificadores de cuenta, teléfonos ni cadenas con aspecto de dato personal.
Son nombres de herramientas, consultas de descarga y algunas cadenas con
operadores de búsqueda. El export tampoco expone el identificador de la
propiedad ni la cuenta de Search Console. Si un export futuro trajera consultas
con datos personales, **no se versiona la tabla de consultas**: se versiona un
derivado agregado y se declara aquí el recorte.

## Preparación para F7

F7 (`docs/mejora/seguimiento.md`, aún sin escribir; issue #47) compara a 14 y
28 días. Esta evidencia es su **«antes»**, con estas condiciones:

- **Ventana de referencia:** 2026-06-19 → 2026-08-26. Últimos 14 días
  (2026-08-13 → 2026-08-26): 4.346 impresiones y 36 clics. Los 14 previos
  (2026-07-30 → 2026-08-12): 915 impresiones y 9 clics.
- **La comparación es de propiedad, no de ficha.** No hay serie por URL. F7
  debe declararlo en cada comparación mientras no exista un export filtrado.
- **El corte por página de esta ventana sí es comparable contra otro corte por
  página de la misma longitud**, siempre que el export futuro se tome con el
  mismo tipo de búsqueda (`Web`) y sin filtros, o con los mismos filtros.
- **El sitio está en crecimiento dentro de la propia ventana** (969 impresiones
  en la primera mitad frente a 5.562 en la segunda) y la cobertura pasó de 20 a
  160 páginas válidas entre el 2026-06-29 y el 2026-08-20. Una subida posterior
  no es atribuible a un cambio editorial sin aislar ese crecimiento de base.
- **Lo que falta para que F7 mida una ficha** está en
  `docs/mejora/blockers/F7-bloqueo-export-gsc-sin-segmentar.md`.
