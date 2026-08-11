# Editorial Writing

## Voz

Escribí para alguien que escanea la página, desconfía de descargas falsas, y quiere llegar rápido al canal oficial correcto para su dispositivo.

Tono:

- claro, no de marketing;
- práctico;
- honesto sobre la incertidumbre (si algo no existe, decilo; si algo cambió de nombre, explicalo);
- específico de esa herramienta — nunca un párrafo que podría pegarse tal cual en otra ficha.

## Estructura

Cada ficha debería responder, en algún punto del contenido:

1. ¿Qué es esta herramienta?
2. ¿Se puede descargar, o es solo web/extensión/tienda?
3. ¿Qué canal oficial conviene usar según mi plataforma?
4. ¿Qué estafas o instaladores falsos hay que evitar con esta herramienta puntual?
5. ¿Cuándo conviene elegirla?
6. ¿Con qué alternativas conviene compararla?

## SEO sin contenido delgado

Usá naturalmente frases como:

- "descargar <herramienta>";
- "<herramienta> para Windows/Mac/Android/iOS";
- "app oficial", "instalador oficial", "web oficial";
- "APK";
- "alternativas a <herramienta>";
- frases de categoría: "generador de imágenes IA", "modelo local", "asistente IA", "video IA", "agente de código".

No hagas keyword-stuffing. Metele la confusión real del usuario al texto: por qué busca esto, qué le puede salir mal, qué duda concreta tiene.

## Secciones editoriales

3-5 secciones, cada una con:

- un encabezado específico de esa herramienta (no genérico tipo "Características");
- dos párrafos cortos;
- al menos una decisión o advertencia concreta, no solo descripción.

Ideas de buenos encabezados (adaptalos, no los copies literal en cada ficha):

- "Por qué tanta gente busca descargar X"
- "X no se instala como una app tradicional" (cuando aplica)
- "Web, escritorio y móvil: qué canal usar"
- "Cómo evitar clones o instaladores falsos"
- "De [nombre anterior] a [nombre actual]" (cuando hubo un rebranding reciente)
- "Cuándo elegir X y cuándo mirar alternativas"

Evitá repetir la misma estructura literal de sección en sección de una ficha a otra — el objetivo es que cada una se sienta escrita para esa herramienta puntual, no rellenada desde una plantilla.

## FAQ

Apuntá a intención de búsqueda real y con potencial de schema FAQPage:

- "¿X tiene app oficial para Windows?"
- "¿Es seguro descargar X desde terceros?"
- "¿X funciona en español?"
- "¿Necesito cuenta para usar X?"
- "¿Existe APK oficial de X?"

Las respuestas tienen que ser concisas y no prometer de más. Si algo no está confirmado, decilo ("no se confirma un instalador oficial para Linux al momento de esta revisión") en vez de asumir que sí existe.

## Cuando la herramienta no tiene instalador o le falta una plataforma

No lo escondas ni lo minimices. Aclarálo en:

- `limitations`;
- `editorialSummary`;
- al menos un bloque de `editorialSections`;
- el FAQ;
- `safetyNotes` (si el vacío de plataforma genera riesgo de apps falsas — suele pasar).

Ejemplos reales de la primera tanda de fichas: Ideogram no tiene app oficial de Android (solo iOS + web); Udio no tiene apps móviles oficiales y en un momento pausó las descargas de audio; Open WebUI no es "instalable con un clic", requiere Docker o Python.

## Herramientas técnicas / self-hosted (Docker, CLI, pip)

Cuando la herramienta no es una app tradicional (agentes de terminal como Qwen Code, interfaces self-hosted como Open WebUI, motores locales como ComfyUI en Linux), no finjas que hay un instalador de un clic. Explicá honestamente el nivel de fricción técnica real y para quién tiene sentido — esto evita generar expectativas falsas y es exactamente el tipo de "confusión real del usuario" que la voz editorial de este catálogo busca resolver.
