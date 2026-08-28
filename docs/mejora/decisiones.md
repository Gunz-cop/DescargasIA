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

| Ruta pública de guías localizadas | Se habilita `/{lang}/guias/{slug}` mediante la implementación integrada en PR #78; las guías deben existir en la colección y solo se generan para idiomas y archivos presentes. | La colección `guides` ya existía, pero publicar contenido sin una ruta con canonical, hreflang, sitemap y enlazado definidos dejaba un contrato SEO incompleto. |
| Slugs F4-SV | Se aprueban exactamente `ai-transkribering-svenska`, `ai-skriva-text-svenska`, `kora-ai-lokalt` y `ai-presentation-svenska`, bajo `src/content/guides/sv/`. | Son los cuatro intents seleccionados por el research sueco; se normaliza `köra` a ASCII para el nombre de archivo sin cambiar la consulta editorial. |

| Evidencia de canales F4 | Codex verifica directamente las URLs oficiales y versiona una tabla fechada en docs/mejora/evidencia-canales-F4-2026-08-27.md; F4 consume solo filas verificadas. | Las sesiones ejecutoras no tienen egress ni navegador suficiente para comprobar el canal y su tipo. |

| Evidencia de Search Console | Los exports entregados por el propietario se ingieren como **evidencia derivada versionada y fechada** en `docs/mejora/evidencia/<fuente>-<fecha>/`, con procedencia, SHA-256 del archivo original y límites declarados. Los ZIP crudos no se versionan. | Un CSV suelto sin su periodo, su tipo de búsqueda y sus filtros se vuelve una cifra sin contrato en cuanto pasa una semana. El SHA-256 permite comprobar que el derivado corresponde al adjunto del issue. |
| Alcance de lo que demuestra un export agregado | Un export de Search Console **sin filtro de página** aporta volumen por página y tendencia de propiedad, y **no** aporta consulta por ruta, país por producto lingüístico ni tendencia por URL. Afirmar cualquiera de esas tres exige un export nuevo con el filtro aplicado. | Las tablas del export son agregados por dimensión, no un cubo cruzado. Cruzarlas a mano produciría una atribución que el archivo no soporta. |

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
| F5.1 | Común | `src/utils/guide-links.ts`, `src/utils/guides.ts`, `src/pages/[lang]/[slug].astro`, `src/i18n/ui.ts`, `tests/guias-fichas.test.ts`, `tests/guias-rutas.test.mjs`, `docs/ux-tool-pages.md`, `docs/enlazado-interno.md` | `src/content/tools-base/`, `src/content/tools/<lang>/`, `src/content/guides/`, `src/content.config.ts`, `public/robots.txt`, `public/_headers`, `.well-known/`, `/r`, canonical, hreflang y el selector de idioma |
| F6 | Común | Informe de validación que su issue/spec enumere | Cualquier código o contenido que no esté bajo revisión explícita |
| F7 | Común | `docs/mejora/seguimiento.md` | Código, contenido y conclusiones de otros productos no medidos |
| Codex (ingesta de evidencia) | Común | `docs/mejora/evidencias.md` y `docs/mejora/evidencia/` | Cualquier documento de fase: la ingesta aporta la evidencia; la conclusión la escribe la fase propietaria |

Regla de bloqueo: si una fase necesita editar un archivo que aparece como
protegido, su spec está mal cortada. Se corrige la spec o se secuencia la fase;
no se esquiva el límite.

## Decisiones abiertas

| Decisión pendiente | Responsable de cerrarla | Bloquea |
|---|---|---|
| Alcance geográfico inicial de `es` (un país o hispanohablante multi-país) | F2-ES/Codex antes de seleccionar oportunidades | Research y prioridades españolas. **Sigue abierta tras la ingesta del 2026-08-28**: el export trae países de la propiedad completa, sin cruce con ruta ni idioma |
| Proveedor y formato de medición del funnel | F1/Codex | Instrumentación y comparación postpublicación |
| Permisos y política de los workflows de GitHub Actions para esta serie | Codex antes de automatizar | CI o arnés adicional |
| Contrato de CSP: endpoint de reportes, tratamiento de los cinco scripts inline y criterio de reversión si el enforcement degrada ingresos | Propietario/Codex con reportes reales de producción | Cualquier CSP, `frame-ancestors` y el cierre de #88 |
| HSTS: si la zona ya la emite, `max-age`, `includeSubDomains`/`preload` y dónde se declara | Propietario, con acceso a producción y al panel de Cloudflare | Activar HSTS en #88 |

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
| 2026-08-27 | Codex | Se decide crear una ruta pública para guías localizadas como fase previa a F4-SV. | La colección `guides` ya existe y la lógica del sitemap anticipa `/{lang}/guias/{slug}`, pero no hay ruta; publicar contenido antes de resolver canonical, hreflang, sitemap y enlazado produciría páginas sin contrato SEO. |
| 2026-08-28 | Codex | Se cierra la puerta de ruta para F4-SV: PR #78 está fusionado en `main`; se autorizan solo los cuatro slugs definidos en esta fecha. | El bloqueo #79 detectó que la spec conservaba el estado anterior y no tenía nombres de archivo ejecutables. |
| 2026-08-28 | Codex/F5.1 | Se aprueba la vía A de #83: la ficha publica un bloque derivado con las guías de su idioma que ya la enlazan. | Es la única de las cuatro vías que no toca contenido de F4 ni el esquema de `guides`/`tools-base`. La relación ya existe en el Markdown publicado, así que invertirla no inventa nada. B exigiría dar significado al campo `category` y reescribir las cinco guías; C añadiría un campo de slugs al frontmatter, también contenido de F4; D dejaría el descubrimiento dependiendo de un enlace de cabecera que Google descuenta como boilerplate. |
| 2026-08-28 | Codex/F5.1 | La inversión reconoce exactamente dos formas de destino —`/{lang}/{slug}` y `/r?t={slug}&…&l={lang}`— y ninguna otra señal. | Las dos son declaraciones explícitas y no ambiguas del slug, producidas por `toolUrl()` y `redirectUrl()`. Resolver por `category`, `tags`, título o texto libre sería una heurística: produciría relaciones que ningún editor escribió, y `category` vale hoy el literal `"guias"` en las cinco guías. |
| 2026-08-28 | Codex/F5.1 | No se añade `alternatives` por idioma, ni campo nuevo en el frontmatter de `guides`, ni ruta escrita a mano. | La relación es asimétrica por naturaleza (una guía es de un idioma) y ya está en el cuerpo; duplicarla en un campo obligaría a mantener dos verdades. Las URLs salen de `guideUrl()`/`guideIndexUrl()`, por la regla 1 de `docs/enlazado-interno.md`. |
| 2026-08-28 | Codex/F5.1 | El bloque va al final de la ficha, antes de "sigue explorando", y no se renderiza si la lista está vacía. | La ficha resuelve primero "dónde descargo esto"; la guía es salida, no decisión. Un bloque vacío o un "todavía no hay guías" sería contenido delgado sin función. |
| 2026-08-28 | Codex/#50 | Se ingieren los cuatro exports de Search Console del 2026-08-28 como evidencia derivada en `docs/mejora/evidencia/gsc-2026-08-28/` y se actualiza la sección de Search Console de la baseline. | El propietario los entregó en #50. El corte es de propiedad `fuenteai.com`, tipo de búsqueda `Web`, 2026-06-19 a 2026-08-26, sin ningún filtro de página, consulta, país o dispositivo. Se versiona el derivado y no el ZIP: conserva el dato y deja constancia del origen y su SHA-256. |
| 2026-08-28 | Codex/#50 | #50 **no se cierra**. Queda acotado a tres faltas: export filtrado por `/es/`, cruce consulta × país y serie temporal por URL. | El export entregado desbloquea volumen por página y tendencia de propiedad, pero no permite atribuir ninguna consulta a una ruta `/es/*` ni medir una ficha concreta en el tiempo. Cerrar el blocker con esto daría por resuelto algo que el archivo no demuestra. |
| 2026-08-28 | Codex/#50 | El «antes» de F7 para el producto `es` es la serie diaria de propiedad 2026-06-19 → 2026-08-26 (6.531 impresiones, 47 clics) más el corte por página de esa misma ventana. | Es la única línea base con periodo y filtros verificables hoy. F7 debe comparar contra ella declarando que la comparación es de propiedad, no de ficha, mientras no exista un export filtrado. |
| 2026-08-28 | Codex/#88 | Se añaden a `public/_headers` sólo cuatro cabeceras defensivas —`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: geolocation=(), microphone=(), camera=()` y `X-Frame-Options: SAMEORIGIN`— y ninguna más. | Son las únicas verificables desde el repositorio con `wrangler dev --local` y las únicas que no pueden alterar la carga de los anuncios, el funnel de `/r` ni las superficies de agentes. Comprobado en 21 superficies HTTP y en navegador a 1280×800 y 360×740. Evidencia en `docs/mejora/evidencia-cabeceras-2026-08-28.md`. |
| 2026-08-28 | Codex/#88 | No se escribe CSP, ni siquiera en `report-only`, ni se declara `report-to`/`report-uri`. | Los `invoke.js` de la red publicitaria eligen orígenes en tiempo de ejecución (#91 observó uno ausente del código) y producción inyecta `static.cloudflareinsights.com`. Una lista de permitidos escrita desde el código estaría incompleta por construcción y apagaría los anuncios, que #87 fijó como monetización que no se retira. `report-only` sin endpoint donde observar reportes no produce evidencia. Blocker en `docs/mejora/blockers/F6-security-headers-csp.md`. |
| 2026-08-28 | Codex/#88 | No se activa HSTS. | `https://fuenteai.com` no era alcanzable desde la sesión (`CONNECT tunnel failed, response 403`): no se pudo observar si la zona ya la emite ni con qué valor. Es de las pocas cabeceras que un error deja clavada en el navegador del visitante. |
| 2026-08-28 | Codex/#88 | `Referrer-Policy` se fija en `strict-origin-when-cross-origin` y no en el `same-origin` que usa la API. | Coincide con el valor por defecto de los navegadores actuales, así que no recorta nada de lo que el sitio envía hoy. `same-origin` o `no-referrer` dejarían sin origen al destino oficial al que sale `/r` y a las peticiones de anuncios: eso es una decisión de monetización, no de hardening. |
| 2026-08-28 | Codex/#88 | `Permissions-Policy` deniega exactamente tres capacidades y no se amplía «por completitud». | `attribution-reporting`, `browsing-topics` e `interest-cohort` tocan la medición publicitaria y `webgpu` lo usa `src/lib/browser/detect.ts` en la app de hardware. Una lista larga es la forma silenciosa de apagar un ingreso o una función. |
| 2026-08-28 | Codex/#88 | `public/_headers` mantiene **un único** bloque `/*`. | Se midió que dos bloques con patrón idéntico no se acumulan: el segundo sustituyó al primero y la cabecera `Link` de descubrimiento desapareció de todas las respuestas, sin que `wrangler` diera error. El aviso queda escrito en el propio archivo y en `docs/agent-readiness.md`. |
