# F3-ES · Lote 4 — guía de intención «IA local sin conexión» · **BLOQUEADA**

**Spec madre:** `docs/mejora/specs/es.md`
**Research de origen:** `docs/mejora/research/es.md` §3.5, §3.6 y §4 (fila 6)
**Producto:** `es`
**Rama base:** `main`
**Ejecuta:** F4-ES, **solo si Codex desbloquea**
**Depende de:** F3-ES (#40) fusionada · decisión abierta de `docs/mejora/decisiones.md` sobre la ruta pública de las guías · ausencia de ruta para la colección `guides` · F1 (#36) no fusionada

> **Esta spec no se ejecuta.** Es la única página nueva que propone el research
> español y hoy **no puede publicarse**. Queda documentada para que la decisión
> se tome con el contenido delante, no para que alguien la ejecute a medias.

---

## Objetivo

Dejar especificada, y explícitamente bloqueada, la guía de intención que
respondería a `qué IA puedo usar sin conexión en mi PC`: la única fila del
research que no se resuelve reforzando una ficha, porque su intención es
informativa y transversal a varias herramientas.

## Contrato de entrada

- `docs/mejora/research/es.md` §3.5: en la consulta observada hay contenido
  español correcto que **enumera herramientas sin resolver la pregunta previa**
  —qué modelo aguanta el equipo de quien pregunta—, que es donde el usuario se
  atasca. Intención informativa, **no** de ficha.
- `docs/mejora/research/es.md` §3.6: los requisitos que circulan en español se
  presentan como umbral único, sin relación con el modelo ni la cuantización.
- `docs/mejora/research/es.md` §6, prioridad 4: la publicación de esta guía
  **depende de una decisión abierta** que F2-ES no cierra.
- El sitio ya tiene la app de compatibilidad de hardware, publicada en
  `/es/puedo-correr-ia`, y las fichas de la categoría `modelos-locales`.

### Por qué está bloqueada — evidencia

1. **No hay ruta pública para las guías.** La colección `guides` existe en
   `src/content.config.ts`, hay un archivo en `src/content/guides/`, pero **no
   existe `src/pages/[lang]/guias/[slug].astro`**. `docs/enlazado-interno.md`
   §7 lo documenta como pendiente conocido: la guía que ya hay «no se
   publica».
2. **La decisión está abierta en el gobierno.** `docs/mejora/decisiones.md`
   registra como decisión abierta «Si las guías de intención necesitan una ruta
   pública antes de desbloquearse», con Codex como responsable y «cualquier
   guía nueva» como bloqueada.
3. **Crear la ruta está fuera de alcance.** Tocar `src/pages/`, el sitemap, el
   canonical o el hreflang no pertenece ni a F3-ES ni a F4-ES según la matriz
   de `docs/mejora/decisiones.md`.

Escribir la guía sin ruta produciría un archivo Markdown que no se renderiza,
sin canonical, sin hreflang y sin enlaces entrantes: exactamente la página
huérfana que `docs/enlazado-interno.md` §3 prohíbe.

## Pregunta a Codex

> ¿Se aprueba crear la sección pública de guías —ruta, canonical, hreflang,
> enlaces entrantes y presencia en el sitemap— como fase propia, previa a
> cualquier guía de intención española; o se descarta la fila 6 del research y
> su contenido se reparte entre las fichas de `modelos-locales` y la app de
> compatibilidad, que ya están publicadas?

Mientras no haya respuesta, esta spec permanece bloqueada. No se ejecuta «solo
el contenido» ni se crea la ruta por iniciativa de la sesión.

## Contrato de salida

**Mientras siga bloqueada:** ninguno. Esta spec es el entregable.

**Si Codex desbloquea por la vía de la sección de guías:**

- una fase previa, con issue propio, crea la ruta y su enlazado;
- después, este lote produce `src/content/guides/ia-sin-conexion-en-tu-pc.md`
  (nombre propuesto, sujeto a la decisión) con la estructura de abajo.

**Si Codex desbloquea por la vía del reparto:** esta spec se cierra sin
entregable y las decisiones editoriales de abajo se trasladan, sin la parte de
guía, a un lote de refuerzo de fichas de `modelos-locales`.

## Decisión por oportunidad (condicionada al desbloqueo)

### Fila 6 — `qué IA puedo usar sin conexión en mi PC`

| Campo de decisión | Contenido |
|---|---|
| **Tipo de página** | **Guía de intención**, no ficha. Es la única fila del research con esta clasificación, y el motivo está declarado: la intención es informativa y transversal a varias herramientas |
| **Intención primaria** | Informativa: entender qué se puede ejecutar en el propio equipo sin conexión |
| **Intenciones secundarias** | Capacidad del equipo, privacidad de los datos entendida como «no salen del equipo» —hecho de arquitectura, no claim legal—, qué herramienta elegir después, cómo empezar |
| **Respuesta above the fold** | Que la pregunta correcta no es «qué herramienta» sino «qué modelo aguanta mi equipo», y que el sitio ya tiene una app para responderla. Es el hueco exacto que el research encontró sin cubrir |
| **Plataformas y canales** | La guía no distribuye nada: enlaza a fichas existentes, que a su vez enlazan a sus canales oficiales. No introduce ningún destino externo nuevo |
| **Secciones únicas** | (a) por qué la capacidad del equipo manda sobre la elección de herramienta; (b) qué significa exactamente «sin conexión» —qué necesita internet una vez y qué no lo necesita nunca—; (c) cómo se relacionan modelo, cuantización y memoria, sin dar un umbral único, que es el error que el research observa en el contenido español existente; (d) qué hacer después, con salida hacia las fichas |
| **FAQ y advertencias** | FAQ derivadas de las consultas de §3.5 y §3.6. Advertencia central: los requisitos dependen del modelo y de la cuantización, no hay una cifra única; la guía no promete rendimiento |
| **Enlaces internos** | `/es/puedo-correr-ia` como salida principal; `/es/categoria/modelos-locales`; fichas ya existentes de esa categoría, entre ellas `/es/ollama` y `/es/lm-studio`. Todo enlace sale de los helpers de `src/utils/links.ts`. **Enlaces entrantes**: sin al menos uno, la guía sería una página huérfana y no debe publicarse |
| **Eventos de funnel** | La guía no genera `ficha_view`: el esquema de F1 (#36) instrumenta fichas e interstitial, no guías. Medir esta página exigiría **ampliar el esquema de F1**, que es una decisión de esa fase, no de esta. Se declara como límite, no se inventa un evento |
| **Ventana y métrica** | Ventana de 90 días desde la publicación. Primaria: navegación de la guía hacia `/es/puedo-correr-ia` y hacia fichas de `modelos-locales`, medible **solo** si F1 amplía su esquema. Secundaria (condicionada a #50): consultas de §3.5 y §3.6. Hoy **ninguna de las dos es medible**, y por eso la publicación sin decisión previa no podría juzgarse |

## Archivos que posee

- Ninguno mientras la spec siga bloqueada.
- Si Codex desbloquea por la vía de la sección de guías:
  `src/content/guides/ia-sin-conexion-en-tu-pc.md` (nombre propuesto), y nada
  más. La ruta, el enlazado y el sitemap pertenecerían a la fase previa que
  cree la sección.

## PROTEGIDOS

- `src/content/guides/descargar-chatgpt-para-windows.md`
- `src/content/tools/es/ollama.json`
- `src/content/tools/es/lm-studio.json`
- `src/content/tools-base/ollama.json`
- `src/content/tools-base/lm-studio.json`
- `src/content/tools/sv/`
- `src/content/tools/it/`
- `src/content/categories/`
- `src/content.config.ts`
- `src/pages/`
- `src/components/`
- `src/layouts/`
- `src/utils/`
- `src/i18n/`
- `docs/mejora/specs/es.md`
- `docs/mejora/research/es.md`
- `docs/mejora/decisiones.md`
- `AGENTS.md`
- `public/`
- `worker/`
- `scripts/`
- `.github/workflows/`
- `package.json`
- `package-lock.json`

## Instrucciones

1. **No ejecutes este lote.** Comprueba primero, con los criterios de abajo,
   que las condiciones de bloqueo siguen vigentes.
2. Si siguen vigentes, no escribas nada: enlaza esta spec en el hilo de la
   decisión y espera respuesta a la pregunta a Codex.
3. Si Codex responde «sección de guías», abre una fase previa con issue propio
   para la ruta y el enlazado. Este lote no la crea.
4. Si Codex responde «reparto», cierra esta spec sin entregable y traslada las
   decisiones editoriales a un lote de fichas de `modelos-locales`, respetando
   que una ficha no es una guía.
5. En cualquiera de los dos casos, actualiza esta spec con la decisión, su
   fecha y su motivo antes de ejecutar nada.

## Fuera de alcance

- Crear `src/pages/[lang]/guias/[slug].astro` o cualquier otra ruta.
- Tocar sitemap, canonical, hreflang, robots o el selector de idioma.
- Publicar un Markdown en `src/content/guides/` sin ruta que lo renderice.
- Ampliar el esquema de eventos de F1 para poder medir guías — es de F1 (#36).
- Reescribir las fichas de `modelos-locales`, que pertenecen a otro lote.
- Prometer rendimiento, tiempos de respuesta o cifras de memoria sin fuente.

## Criterios de aceptación

Mientras la spec esté bloqueada, sus criterios comprueban **que el bloqueo es
real**, no que la guía exista.

- [ ] `node -e "const fs=require('fs');process.exit(fs.existsSync('src/pages/[lang]/guias/[slug].astro')?1:0)"` sale 0 — no existe ruta de guías; si algún día sale 1, el bloqueo técnico ha desaparecido y esta spec debe revisarse.
- [ ] `node -e "const fs=require('fs');const t=fs.readFileSync('docs/mejora/decisiones.md','utf8');process.exit(t.includes('las guías de intención necesitan una ruta pública')?0:1)"` sale 0 — la decisión sigue registrada como abierta en el gobierno.
- [ ] `node -e "const fs=require('fs');const g=fs.readdirSync('src/content/guides');process.exit(g.length===1&&g[0]==='descargar-chatgpt-para-windows.md'?0:1)"` sale 0 — no se ha añadido ninguna guía nueva mientras el bloqueo está vigente.
- [ ] `node -e "const fs=require('fs');const g=['descargar-chatgpt-para-windows.md','ia-sin-conexion-en-tu-pc.md'];process.exit(g.length===1?1:0)"` sale 0 — **prueba con dato inválido**: con una guía nueva presente, la comprobación anterior falla, que es el comportamiento buscado.
- [ ] `[manual]` Estado de la decisión: 1. abre el issue #40 y el hilo de la decisión abierta en `docs/mejora/decisiones.md`; 2. comprueba si Codex ha respondido a la pregunta de esta spec; 3. resultado esperado mientras siga bloqueada: no hay respuesta y no se ejecuta nada.

## Riesgos conocidos

| Riesgo | Evidencia que lo detecta | Quién lo resuelve |
|---|---|---|
| Una sesión escribe la guía «para que esté lista» y queda sin publicar | El criterio del recuento de `src/content/guides/` | La sesión, parándose |
| Se crea la ruta desde este lote para desbloquearse | El diff tocaría `src/pages/`, que está en PROTEGIDOS | Revisión del PR |
| La decisión se cierra pero nadie actualiza esta spec | El criterio manual del estado de la decisión | Quien cierre la decisión |
| Se publica la guía sin enlaces entrantes | `npm run links:audit` marca páginas indexables huérfanas | La fase que cree la sección |
| Se mide la guía inventando un evento fuera del esquema de F1 | Los tests de esquema de F1 rechazan nombres no declarados | F1 (#36) |
