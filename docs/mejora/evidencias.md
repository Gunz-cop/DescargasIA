# Registro de evidencias de la mejora por producto lingüístico

> Índice de la evidencia externa versionada en esta serie. Cada entrada dice
> qué archivo la contiene, de dónde salió, qué periodo cubre, qué filtros tenía
> y **qué no demuestra**. Un dato sin esas cinco cosas no entra aquí.

Regla: la evidencia se versiona **derivada y fechada**, nunca como export crudo
si el original puede contener datos privados o identificadores de cuenta. El
derivado conserva la trazabilidad al archivo original, su fecha y su SHA-256.

## Entradas

| Fecha | Fuente | Dónde vive | Periodo cubierto | Filtros del corte | Estado |
|---|---|---|---|---|---|
| 2026-08-28 | Google Search Console (rendimiento, cobertura, cobertura válida, enlaces) | `docs/mejora/evidencia/gsc-2026-08-28/` | Rendimiento 2026-06-19 → 2026-08-26; cobertura 2026-06-18 → 2026-08-20 | Propiedad `fuenteai.com`, tipo de búsqueda `Web`, **sin filtro de página, consulta, país ni dispositivo** | Vigente. Entregada en [#50](https://github.com/Gunz-cop/DescargasIA/issues/50) |
| 2026-08-27 | Verificación directa de canales oficiales (Codex) | `docs/mejora/evidencia-canales-F4-2026-08-27.md` | Comprobación puntual del 2026-08-27 | URLs oficiales de las herramientas de F4 | Vigente para F4 |

## Quién consume cada una

| Evidencia | Consumidores declarados | Qué **no** puede sostener |
|---|---|---|
| GSC 2026-08-28 | `docs/mejora/baseline.md` (Search Console), `docs/mejora/research/es.md` §4.2, F1 y F7 como línea base del «antes» | Demanda por consulta de una ficha, tendencia de una URL, país de un producto lingüístico, comportamiento dentro del sitio o salida por `/r` |
| Canales F4 2026-08-27 | F4-ES, F4-SV, F4-IT | Cualquier canal no listado en la tabla, y cualquier fila marcada como discrepante |

## Lo que sigue sin evidencia versionada

| Hueco | Quién lo bloquea | Registro |
|---|---|---|
| Export de Search Console **filtrado por `/es/`** (consultas, páginas y países) y serie por URL | F7, F3-ES | `docs/mejora/blockers/F7-bloqueo-export-gsc-sin-segmentar.md` · [#50](https://github.com/Gunz-cop/DescargasIA/issues/50) |
| Export original de Cloudflare Web Analytics | F1 | `docs/mejora/baseline.md`, sección de Cloudflare: sus filtros siguen «no preservados» |
| Herramienta de keywords con volumen por mercado | F2 de cualquier idioma | `docs/mejora/research/es.md` §1.2 |

## Cómo añadir una entrada

1. Crear `docs/mejora/evidencia/<fuente>-<fecha>/` con los CSV derivados y un
   `README.md` que declare: procedencia, SHA-256 del archivo original, periodo
   real (no la etiqueta de la interfaz), filtros aplicados, totales
   verificables y límites.
2. Comprobar que el derivado no contiene datos personales, identificadores de
   cuenta ni credenciales. Si los contiene, versionar un agregado y declarar
   aquí el recorte.
3. Añadir la fila a la tabla de arriba y a las dos tablas siguientes.
4. Registrar la decisión en `docs/mejora/decisiones.md`.
5. Actualizar el documento propietario del dato (`baseline.md` para la línea
   base, el `research/<lang>.md` correspondiente para la selección). La
   ingesta aporta la evidencia; la conclusión la escribe la fase propietaria.
