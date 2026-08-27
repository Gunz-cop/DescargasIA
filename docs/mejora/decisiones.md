# Gobierno de la mejora por producto lingüístico

> F0 · registro de decisiones y límites de ejecución. El plan de producto es
> `docs/plan-mejora-productos-por-idioma.md`; este documento no duplica su
> contenido editorial ni mantiene estados operativos.

## Decisiones cerradas

| Decisión | Resolución | Motivo |
|---|---|---|
| Unidad de producto | `es`, `sv` e `it` se investigan, priorizan y redactan por separado. | Una ficha o consulta de un idioma no demuestra demanda en otro. |
| Infraestructura compartida | Solo se comparte lo que sea realmente común: esquema, componentes, validadores, seguridad e instrumentación aprobada. | Reutilizar código no debe heredar decisiones editoriales. |
| Fuente del estado | Las etiquetas `estado:*` de GitHub son la única fuente del estado de las fases. | Una tabla manual en el repositorio deriva del issue y se vuelve falsa. |
| Baseline | Search Console aporta adquisición e indexación; Cloudflare aporta comportamiento. | Tienen unidades, filtros y límites de atribución diferentes. |
| Destinos | Solo se aceptan dominios oficiales, tiendas oficiales, repositorios oficiales o documentación oficial. | DescargasIA no aloja instaladores ni publica mirrors. |
| F0 | No añade eventos, proveedor de analítica, fichas, copy, rutas, indexación ni idiomas. | Esos trabajos pertenecen a F1, F2/F3 y sus implementaciones posteriores. |
| Criterios SDD | Toda fase nueva debe tener contrato de entrada/salida, propiedad, protegidos, fuera de alcance, riesgos y criterios ejecutables. | Una sesión limpia debe poder trabajar sin recuperar conversaciones. |

| Evidencia de canales F4 | Codex verifica directamente las URLs oficiales y versiona una tabla fechada en docs/mejora/evidencia-canales-F4-2026-08-27.md; F4 consume solo filas verificadas. | Las sesiones ejecutoras no tienen egress ni navegador suficiente para comprobar el canal y su tipo. |

## Límites por producto

| Área | Puede decidir | No puede heredar automáticamente |
|---|---|---|
| `es` | Países objetivo, variante del español, consultas, fichas, guías, copy y prioridades españolas. | Consultas, selección o conclusiones de `sv`/`it`. |
| `sv` | Suecia, variante y registro suecos, consultas y selección suecas. | Consultas, selección o conclusiones de `es`/`it`. |
| `it` | Italia, variante y registro italianos, consultas y selección italianas. | Consultas, selección o conclusiones de `es`/`sv`. |
| Común | Contratos técnicos, seguridad, validadores, medición aprobada y componentes compartidos. | Keywords, demanda, copy, FAQ, alternativas o prioridades lingüísticas. |

Las rutas, canonical, hreflang, robots y el selector de idioma no se cambian
como consecuencia de F0. Si una fase los necesita, debe tener una autorización
explícita y criterios propios.

## Matriz de propietarios y protegidos

La propiedad se refiere a los archivos que una fase puede crear o editar. Los
archivos protegidos son límites de la sesión y deben repetirse en la spec
concreta antes de que una fase empiece. Ninguna fase puede editar el contenido
de otro producto.

| Fase | Producto | Propietario | Protegidos mínimos |
|---|---|---|---|
| F0 | Común | `docs/plan-mejora-productos-por-idioma.md`, `docs/mejora/baseline.md`, `docs/mejora/decisiones.md`, `docs/mejora/fases/F0.md`, `docs/mejora/templates/` | Código del sitio, contenido, rutas, SEO, `public/`, `worker/` y las salidas de F1–F7 |
| F1 | Común | `docs/mejora/fases/F1.md` y la documentación/módulo de medición que su propia spec enumere | Contenido localizado, rutas, SEO y cualquier archivo que no figure en su spec |
| F2-ES | `es` | `docs/mejora/research/es.md` | `docs/mejora/research/sv.md`, `docs/mejora/research/it.md` y todos los JSON de contenido |
| F2-SV | `sv` | `docs/mejora/research/sv.md` | `docs/mejora/research/es.md`, `docs/mejora/research/it.md` y todos los JSON de contenido |
| F2-IT | `it` | `docs/mejora/research/it.md` | `docs/mejora/research/es.md`, `docs/mejora/research/sv.md` y todos los JSON de contenido |
| F3-ES | `es` | `docs/mejora/specs/es.md` y specs hijas que enumere | `docs/mejora/specs/sv.md`, `docs/mejora/specs/it.md` y contenido del sitio |
| F3-SV | `sv` | `docs/mejora/specs/sv.md` | `docs/mejora/specs/es.md`, `docs/mejora/specs/it.md` y contenido del sitio |
| F3-IT | `it` | `docs/mejora/specs/it.md` | `docs/mejora/specs/es.md`, `docs/mejora/specs/sv.md` y contenido del sitio |
| F4-ES | `es` | `src/content/tools/es/` y archivos comunes enumerados por su spec aprobada | `src/content/tools/sv/`, `src/content/tools/it/`, rutas y SEO |
| F4-SV | `sv` | `src/content/tools/sv/` y archivos comunes enumerados por su spec aprobada | `src/content/tools/es/`, `src/content/tools/it/`, rutas y SEO |
| F4-IT | `it` | `src/content/tools/it/` y archivos comunes enumerados por su spec aprobada | `src/content/tools/es/`, `src/content/tools/sv/`, rutas y SEO |
| F5 | Común | Archivos comunes y relaciones que su spec enumere | Contenido no aprobado por F3/F4, `public/robots.txt`, `public/_headers` y `.well-known/` |
| F6 | Común | Informe de validación que su issue/spec enumere | Cualquier código o contenido que no esté bajo revisión explícita |
| F7 | Común | `docs/mejora/seguimiento.md` | Código, contenido y conclusiones de otros productos no medidos |

Regla de bloqueo: si una fase necesita editar un archivo que aparece como
protegido, su spec está mal cortada. Se corrige la spec o se secuencia la fase;
no se esquiva el límite.

## Decisiones abiertas

| Decisión pendiente | Responsable de cerrarla | Bloquea |
|---|---|---|
| Alcance geográfico inicial de `es` (un país o hispanohablante multi-país) | F2-ES/Codex antes de seleccionar oportunidades | Research y prioridades españolas |
| Proveedor y formato de medición del funnel | F1/Codex | Instrumentación y comparación postpublicación |
| Si las guías de intención necesitan una ruta pública antes de desbloquearse | F3/Codex | Cualquier guía nueva |
| Permisos y política de los workflows de GitHub Actions para esta serie | Codex antes de automatizar | CI o arnés adicional |

No se rellenan estas celdas con un proveedor, país, URL o credencial
inventados. La decisión cerrada debe entrar aquí con fecha y motivo antes de
que la fase bloqueada la use.

## Registro

| Fecha | Fase | Decisión | Motivo |
|---|---|---|---|
| 2026-08-26 | F0 | Se conserva el baseline resumido y se explicitan sus filtros no preservados. | Los exports originales no están versionados en el repositorio. |
| 2026-08-26 | F0 | Los issues de GitHub y sus etiquetas son el estado operativo. | El plan maestro no debe mantener una segunda tabla de estado. |
| 2026-08-27 | F0 | `main` es la rama de integración de esta serie. | Fija un único destino de integración para los PRs de F1–F7 y evita que cada fase invente una rama base distinta. |
| 2026-08-27 | Codex/F4 | Se adopta la tabla versionada de evidencia directa como entrada autorizada para la verificación de canales. | Las sesiones ejecutoras no pueden abrir los dominios oficiales; la tabla conserva URL, fecha, editor/proyecto, tipo observado y discrepancias. La fila ollama/mac queda bloqueada por #60. |
