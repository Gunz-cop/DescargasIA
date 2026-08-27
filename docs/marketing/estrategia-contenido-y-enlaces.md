# Estrategia de contenido y autoridad — FuenteAI

Fecha: 27 de agosto de 2026. Documento de decisión, no de ideas.

---

## 1. El diagnóstico

El plan inicial era: escribir un artículo, publicarlo en Medium, sembrarlo en
redes, ganar un enlace. Ese plan no funciona, y conviene decir por qué antes de
sustituirlo.

- **Todos esos enlaces son `nofollow`.** Medium, LinkedIn, Tumblr y Menéame no
  transmiten autoridad. Cero. Un artículo sembrado en las cuatro plataformas
  produce exactamente cero mejora de posicionamiento por enlaces.
- **Un artículo no es una estrategia.** Es un activo suelto. Sin cadencia y sin
  un sitio donde acumular, el pico de tráfico del día 1 se apaga en 72 horas y
  no queda nada.
- **Y sobre todo: el blog no es el motor de este sitio.** El motor de FuenteAI
  son las 86 fichas × 3 idiomas compitiendo por long tail de "descargar X". Ahí
  está el tráfico. El contenido editorial no sustituye a eso, lo **respalda**.

Así que la pregunta no es "dónde publico el artículo". Es "qué hace que el
catálogo sea creíble, citable y enlazable". El artículo es una pieza de eso.

## 2. Las tres capas

Todo lo que sigue se ordena en tres capas. Confundirlas es el error más caro.

| Capa | Qué es | Qué aporta | Esfuerzo |
|---|---|---|---|
| **Motor** | El catálogo: fichas, categorías, la app de hardware | El tráfico. Todo el tráfico. | Ya en marcha |
| **Autoridad** | Un blog/laboratorio propio en el dominio | Hace el motor creíble: E-E-A-T, AdSense, ser citado por LLMs, y **los enlaces dofollow** | Lo nuevo |
| **Distribución** | LinkedIn, Medium, Tumblr, HN, Menéame | Descubrimiento. Nunca autoridad. | Recurrente y barato |

**Regla que ordena todo:** un activo solo cuenta si vive en el dominio propio.
Todo lo demás es un anuncio de que existe.

## 3. La decisión estratégica

**Hay una posición libre y estás a un paso de ocuparla.**

FuenteAI hizo algo que casi nadie ha hecho: llevar un sitio real de nivel 1 a
nivel 5 de preparación para agentes — llms.txt, MCP, A2A, WebMCP, ARD, espejo
Markdown — y documentar el proceso, las trampas y las decisiones de no mentir.
Y el método está empaquetado como una skill reutilizable con un escáner
ejecutable.

En español, sobre AEO / agent-readiness / "cómo hago que ChatGPT cite mi web",
**no hay una fuente de referencia**. Hay traducciones de posts en inglés y humo
de agencias. La demanda de búsqueda está subiendo y la oferta con experiencia
real es casi nula.

Esa es la posición: **la referencia en español sobre cómo preparar un sitio para
agentes de IA, escrita por alguien que lo ha hecho de verdad en un sitio en
producción.**

Y no es off-topic para un catálogo de descargas de IA, si se enmarca bien: no es
"el blog de SEO de FuenteAI", es **el laboratorio** — cómo se construye y se
verifica el sitio que estás usando. Eso es exactamente lo que Google llama
E-E-A-T y lo que un revisor de AdSense busca. Refuerza el motor en vez de
diluirlo.

### Lo que se decide, en concreto

1. **El original vive en fuenteai.com**, en una sección `/laboratorio`. Medium,
   dev.to y Hashnode son copias con `rel=canonical` apuntando a casa.
2. **LinkedIn es el canal principal.** Tumblr y Menéame son satélites de coste
   casi cero. No se invierte más en ellos.
3. **La cadencia manda sobre la calidad puntual.** Un artículo al mes, dos o tres
   posts de LinkedIn por semana extraídos del mismo material.
4. **Los enlaces reales no vienen de las redes.** Vienen de tres sitios
   concretos, que están en la sección 6.

## 4. El tema recurrente (lo que hace que esto sea un motor y no un artículo)

El error de la mayoría es publicar un buen artículo y quedarse sin el segundo.
Aquí no pasa, porque la materia prima **ya se genera como subproducto del
trabajo**. El repo tiene documentados, hoy:

- El hito de agent-readiness y sus ocho trampas.
- Las lecciones de aplicar SDD por fases con sesiones de IA independientes.
- El arnés de GitHub Actions que encadena crear → auditar → corregir fichas.
- La auditoría editorial estilo AdSense como criterio escrito.
- El mapa de enlazado interno, hreflang y canonical con auditoría automática.
- La app de compatibilidad de hardware con modelos de IA.

Eso son seis artículos con experiencia de primera mano sin escribir una línea de
investigación nueva. El tema que los une:

> **Construir y operar un sitio de contenido en 2026, con IA, en público.**

Es honesto, es diferencial, se alimenta solo, y cada entrega menciona
fuenteai.com de forma natural porque el sitio *es* el caso de estudio.

## 5. Plan de ejecución — 4 semanas

### Semana 0 (esta): desbloquear y arreglar

- **Cerrar la ruta pública de guías/laboratorio (issue #75).** Es el bloqueante
  de toda la estrategia. Sin sitio donde publicar, no hay activo. Prioridad
  máxima, por encima de escribir nada más.
- **Resolver el envío de Menéame.** Si apunta a una URL que aún no existe, o
  borrarlo o dejarlo morir en pendientes. No insistir.
- **Publicar el artículo en Medium** para tener el enlace vivo, con la intención
  declarada de mover el canonical a casa en cuanto exista `/laboratorio`.

### Semana 1: publicar y distribuir bien

- Artículo original en `fuenteai.com/laboratorio/...`, con canonical de Medium
  corregido hacia él.
- Cross-post en **dev.to** y **Hashnode**, ambos con `canonical_url` al dominio.
- **LinkedIn**: post nativo, sin enlace en el cuerpo, enlace en el primer
  comentario.
- **Hacker News**: versión en inglés. Es el canal con más probabilidad real de
  generar el enlace dofollow, porque su audiencia tiene blog propio.
- **Tumblr**: formato Texto, primeras ~600 palabras + corte.

### Semana 2: atomizar, no producir

Cero artículos nuevos. Del mismo material salen 3 posts de LinkedIn:

1. La tabla de falsos positivos (el gancho fuerte).
2. Las tres trampas técnicas (valor puro para desarrolladores).
3. La decisión de quedarse en 81/100 por no inventar un endpoint OAuth (el
   ángulo ético; es el que más conversación genera).

Cada uno funciona solo y ninguno necesita que hayas leído el artículo.

### Semana 3: el segundo artículo y el primer enlace real

- Escribir el artículo #2. Recomendado: **el arnés de crear → auditar → corregir
  fichas con IA**, porque es el que más interesa a gente con blog técnico propio.
- Ejecutar las acciones de enlaces de la sección 6, que es donde está el retorno
  de verdad.

### Semana 4: medir y decidir

Con datos de 30 días, decidir si esto continúa. Criterios en la sección 7.

## 6. De dónde salen los enlaces dofollow de verdad

Esto es lo que la campaña original no tenía y es lo único que produce autoridad.

1. **Registros de servidores MCP.** Ya está identificado como pendiente en
   `docs/hito-agent-readiness.md`: *"dar de alta el servidor MCP en registros —
   sin esto, /mcp recibe cero llamadas"*. Son enlaces dofollow, permanentes,
   temáticamente perfectos, y además es la única acción que hace que la capa MCP
   sirva para algo. **Es la acción de mayor retorno de todo este documento y no
   es marketing: es producto.** Lo mismo con directorios de `llms.txt` y las
   listas *awesome-* de MCP y A2A en GitHub.

2. **Publicar la skill de agent-readiness como repositorio abierto.** El método,
   la matriz de qué aplica según el tipo de sitio, y el escáner ejecutable. Un
   repo útil se enlaza desde blogs, newsletters y otras listas — y el README
   enlaza a fuenteai.com como el caso real donde se validó. Es el activo más
   enlazable que tienes y ahora mismo está encerrado en un repo privado.

3. **El fallo de criterio de isitagentready.com.** Documentaste que su check de
   `auth.md` contradice su propio criterio publicado: un sitio público sin
   cuentas no puede pasarlo sin inventarse un endpoint de registro. Reportarlo
   en su canal, bien argumentado, es la clase de contribución que se acredita con
   una mención. Y si lo corrigen, subes de 81 a 84 sin tocar el sitio.

Los tres son trabajo real con subproducto de enlace. Ninguno es link building.

## 7. Qué se mide y cuándo se abandona

Métricas, a 30 días desde la publicación del primer artículo:

| Métrica | Cómo | Objetivo realista |
|---|---|---|
| Sesiones de referencia | Analítica, por fuente | 300–800 en total |
| **Menciones nuevas del dominio** | `"fuenteai.com" -site:fuenteai.com` + alerta | La métrica que importa |
| **Enlaces dofollow nuevos** | Cualquier herramienta de backlinks | **2–4**, y vendrán de la sección 6, no de las redes |
| Seguidores/impresiones LinkedIn | Nativo | Tendencia, no valor absoluto |
| Llamadas a `/mcp` | Logs del Worker | Hoy son cero. Cualquier cosa > 0 valida el registro |

**Criterio de abandono, escrito por adelantado para no engañarse después:** si a
los 90 días y con seis artículos publicados el tráfico orgánico del blog no
supera el 5 % del tráfico del catálogo y no hay enlaces dofollow nuevos, la capa
de autoridad no está funcionando. Se congela y el esfuerzo vuelve entero al
motor: más fichas, mejor traducidas.

## 8. Lo que explícitamente no vamos a hacer

- **Publicar en Medium como destino final.** Solo como copia con canonical.
- **Perseguir Menéame.** Un artículo técnico de fondo no llega a portada, y
  forzarlo con autobombo detectable resta. El envío del hardware sí es candidato.
- **Poner enlaces en el cuerpo de los posts de LinkedIn.** Van en el primer
  comentario.
- **Escribir sobre AEO sin haberlo hecho.** El diferencial entero es que aquí se
  hizo y se documentó lo que falló. En cuanto se escribe de oídas, se compite
  con las agencias y se pierde.
- **Comprar enlaces o entrar en intercambios.** El sitio va a pedir revisión de
  AdSense; no vale la pena el riesgo.
