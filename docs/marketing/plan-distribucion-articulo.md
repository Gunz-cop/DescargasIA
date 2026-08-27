# Plan de distribución — artículo "Cinco IAs auditaron mi web"

Artículo: `docs/marketing/articulo-medium-cinco-ias-auditoria.md`

## Lo primero: expectativas realistas sobre los enlaces

**Medium, LinkedIn, Menéame y Tumblr marcan sus enlaces salientes como
`nofollow`.** Ninguno transmite autoridad a fuenteai.com. Lo que aportan es:

1. **Tráfico de referencia** — real y medible desde el día 1.
2. **Descubrimiento** — que alguien con blog propio o newsletter lea el artículo
   y lo cite. *Ese* enlace sí es dofollow, y es el único que mueve la aguja.
3. **Señal de marca** — menciones del dominio en sitios de autoridad alta, que
   los buscadores y los modelos sí registran aunque el enlace no pase PageRank.

Por tanto el objetivo no es "conseguir un backlink", es **conseguir que el
artículo sea lo bastante bueno como para que alguien lo cite**. Todo el plan de
abajo está ordenado según eso.

## Decisión pendiente: dónde vive el original

Lo ideal es que el original esté en **fuenteai.com** y Medium sea la copia con
`rel=canonical` apuntando al dominio propio. Así el contenido, que es el activo,
acumula autoridad en casa.

Ahora mismo la colección `guides` existe pero no tiene ruta pública (issue #75).
Dos opciones:

- **A (recomendada si #75 se cierra pronto):** esperar a la ruta, publicar en
  fuenteai.com, y sindicar a Medium/dev.to con canonical. Es la única versión que
  construye un activo propio.
- **B (si hay prisa):** publicar en Medium ya, y cuando exista la ruta, republicar
  en el sitio y **cambiar el canonical de Medium** para que apunte al dominio.
  Medium lo permite. Se pierde poco.

## Orden de publicación (72 h)

### Día 1 — Medium
Publicar el artículo. Enviarlo además a una publicación de Medium del nicho
(cualquiera de tecnología/IA en español); una publicación con audiencia propia
multiplica las lecturas frente al perfil personal.

Etiquetas: `Inteligencia Artificial`, `SEO`, `Desarrollo Web`, `MCP`,
`Programación`.

### Día 1 (+2 h) — LinkedIn
Es tu canal fuerte. **No pongas el enlace en el cuerpo del post**: LinkedIn
penaliza el alcance de los posts con enlaces salientes. Publica el texto nativo
y pon el enlace en el **primer comentario**, y edítalo también en el post una vez
haya pasado la primera hora de distribución.

Texto en `#post-linkedin` abajo.

### Día 2 — Tumblr
Formato "Texto", no "Enlace" — indexa mejor y permite el artículo casi completo.
Republicar los ~600 primeros palabras + "sigue leyendo en Medium". Etiquetas:
`#inteligencia artificial`, `#programación`, `#seo`, `#desarrollo web`, `#ia`.
Tumblr permite 30 etiquetas pero solo las 20 primeras se indexan.

### Día 2 — dev.to
Cross-post **con la etiqueta canónica** (`canonical_url` apuntando a Medium o al
sitio). Audiencia técnica, buena para el hilo de comentarios, y sus enlaces en
perfil son dofollow. Etiquetas: `ai`, `webdev`, `seo`, `showdev`.

### Día 3 — Menéame
Ojo: Menéame castiga el autobombo detectable. Enviar con el titular del gancho
("Tres de cinco IAs reportaron fallos que no existían al auditar una web") y
**sin** enlazar al sitio propio en la descripción — que el enlace sea al
artículo. Si el envío no arranca en 2 h, no insistir con un segundo envío.

### Extras que valen más que Menéame para este tema concreto
- **Hacker News** (Show HN o enviarlo tal cual, en inglés — requiere traducir).
  Es el canal con más probabilidad de generar el enlace dofollow real.
- **r/webdev**, **r/SEO**, **r/programacion** (este último en español).
- **Lobste.rs** si tienes invitación.
- **Hashnode**, mismo cross-post con canonical.

## Post para LinkedIn

> Auditamos nuestra web con cinco IAs distintas. Tres nos reportaron fallos que
> no existían.
>
> ChatGPT, Claude, DeepSeek, Qwen y Gemini. Conversación nueva, sin contexto, el
> mismo prompt: entra, recupera, navega, dime qué te impide entenderme.
>
> Los informes venían bien redactados y con la estructura correcta. Al
> verificarlos uno por uno con curl:
>
> → "No hay JSON-LD" — lo había, su extractor descarta los <script>
> → "El sitemap da error de conexión" — HTTP 200, 189 URLs
> → "robots.txt inaccesible" — HTTP 200
>
> Si me llego a creer esos informes, habría añadido datos estructurados que ya
> estaban y "arreglado" un sitemap que funcionaba.
>
> La lección se generaliza a casi cualquier uso serio de un LLM como auditor:
>
> Una IA que no puede acceder a un recurso y una IA que ha encontrado un recurso
> defectuoso producen exactamente el mismo informe. El modelo no distingue entre
> "esto no existe" y "yo no lo alcanzo", porque desde su punto de vista son la
> misma observación.
>
> Verificar cada hallazgo contra la fuente no es desconfianza. Es parte del
> método.
>
> La otra mitad de la auditoría sí encontró cosas reales, y el trabajo de fondo
> —llms.txt, MCP, A2A, espejo Markdown, los .well-known— llevó el sitio del
> nivel 1 al 5 de preparación para agentes.
>
> Pero la conclusión que no esperaba fue otra: ninguna de las cinco pudo afirmar
> que el sitio vaya a ser *citado*. La preparación técnica te hace elegible. Lo
> que te hace citable es el trabajo editorial.
>
> Lo he escrito entero, con las tres trampas que más tiempo me costaron 👇
> (enlace en comentarios)

Primer comentario: `Artículo completo: [enlace de Medium]`

## Post para Tumblr

Mismo titular. Primeros ~600 palabras del artículo (hasta el final de la tabla de
falsos positivos, que es el gancho) + "El resto —las tres trampas técnicas y por
qué hay tres comprobaciones que no voy a pasar nunca— en Medium: [enlace]".

## Qué medir

- Referidos por fuente en analítica, a 7 y a 30 días.
- **Menciones nuevas del dominio** — es la métrica que importa. Alerta de Google
  y búsqueda periódica de `"fuenteai.com" -site:fuenteai.com`.
- Enlaces dofollow conseguidos. Objetivo realista de esta campaña: **1 o 2**, y
  vendrán de un blog técnico, no de las redes.

## Segundo artículo, si este funciona

El mismo repo tiene un segundo ángulo listo y más masivo: la app de "qué modelos
de IA puedo correr con mi hardware". Ese sí es material de Menéame y de público
general, mientras que este es material de Hacker News y público técnico. No
mezclar los dos: cada uno a su canal.
