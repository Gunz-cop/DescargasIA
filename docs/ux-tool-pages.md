# UX Tool Pages

Guia para redisenar y mantener las paginas individuales de herramientas (`src/pages/[slug].astro`).

## Rol De La Pagina

Cada pagina de herramienta debe resolver tres preguntas en segundos:

1. Estoy en la herramienta correcta?
2. Cual es el canal oficial para mi dispositivo?
3. Me conviene esta herramienta para lo que quiero hacer?

No debe ser solo una lista de enlaces. Debe funcionar como una ficha editorial de decision: clara para el usuario, util para SEO y segura para monetizacion futura.

## Estructura Recomendada

### 1. Hero De Producto

Debe aparecer arriba de todo.

- Nombre de la herramienta.
- Categoria y estado de confianza.
- Frase corta de posicionamiento: para que sirve.
- CTA primario: `Ir a la descarga oficial`.
- CTA secundario: elegir plataforma o ver requisitos.
- Dominio oficial visible.
- Fecha de ultima revision.

Evitar heroes genericos. El usuario debe entender de inmediato si esta pagina es para ChatGPT, Claude, Gemini, Cursor, Ollama, etc.

### 2. Selector De Plataforma

Debe ser mas claro que una lista plana.

- Web
- Windows
- macOS
- Linux
- Android
- iOS

Cada opcion debe indicar:

- tipo de destino: web app, tienda oficial, instalador oficial, GitHub, documentacion, package manager.
- si requiere cuenta.
- si es descarga o acceso web.
- ultima comprobacion si existe.

### 3. Bloque "Mejor Para"

Esta seccion ayuda a usuarios normales y a futuros asistentes/chatbots.

Ejemplos:

- Mejor para redactar, estudiar y resumir.
- Mejor para programar con autocompletado.
- Mejor para ejecutar modelos locales sin subir datos.
- Mejor para usar IA desde el movil.

No inventar casos de uso. Derivar desde `categories`, `tags`, `longDescription` y revision editorial.

### 4. Resumen Editorial

Contenido breve, escaneable y util.

- Que es.
- Para que sirve.
- Que ofrece gratis o con plan de pago.
- Limitaciones o advertencias.
- Nivel de soporte en espanol.

Debe responder preguntas reales, no repetir copy de marketing.

### 5. Guia Editorial Larga

Cada herramienta prioritaria debe tener contenido unico en `editorialSections`.

Objetivo:

- Reducir riesgo de pagina delgada o hecha solo para redirigir.
- Responder busquedas long-tail reales.
- Mostrar experiencia editorial y criterio de comparacion.
- Mantener el CTA arriba para quien solo quiere salir al canal oficial.

Reglas:

- No rellenar con texto generico.
- No repetir la misma estructura literal en todas las fichas.
- Incluir contexto de uso, riesgos comunes, plataformas, limites y alternativas.
- Mantener headings H2/H3 claros.
- Usar experiencia real cuando exista, sin fingir pruebas que no se hicieron.

### 6. Seguridad Antes De Descargar

Mantener visible el enfoque del proyecto.

- No mirrors.
- No APKs de terceros.
- No instaladores alojados por DescargasIA.
- Dominio oficial.
- Advertencias especificas desde `safetyNotes`.

### 7. Requisitos Y Compatibilidad

Mostrar tabla o grid simple:

- Plataformas disponibles.
- Cuenta requerida.
- Modelo de precios.
- Soporte en espanol.
- Tipo de distribucion por plataforma.

### 8. Alternativas

Mostrar alternativas relacionadas con contexto, no solo enlaces.

Cada alternativa deberia responder:

- En que se parece.
- En que se diferencia.
- Para quien podria ser mejor.

### 9. FAQ

Agregar preguntas frecuentes orientadas a busquedas long-tail.

Ejemplos:

- Es seguro descargar [herramienta]?
- [Herramienta] tiene app para Windows?
- [Herramienta] funciona en Android?
- Necesito cuenta para usar [herramienta]?
- DescargasIA aloja el instalador?

### 10. Fuentes Oficiales

Listar las fuentes usadas para revision editorial.

- Sitio oficial.
- Tiendas oficiales.
- Documentacion oficial.
- Repositorio oficial si aplica.

## SEO Y Adsense

La pagina debe tener contenido propio y util antes y despues del CTA.

Buenas senales:

- H1 especifico.
- Secciones H2 claras.
- Texto original que ayude a decidir.
- FAQ real.
- Fuentes oficiales visibles.
- Schema `SoftwareApplication` (debe usar `"applicationCategory": "OtherApplication"` y `"applicationSubCategory": "Artificial Intelligence"` para catalogar correctamente herramientas de IA), `BreadcrumbList` y, si hay FAQ visible, `FAQPage`.
- Múltiples esquemas estructurados de JSON-LD deben emitirse en etiquetas `<script type="application/ld+json" is:inline>` separadas (mapeando el array) en lugar de una sola etiqueta con un array. La directiva `is:inline` es estrictamente obligatoria para evitar que el compilador de Astro/Vite procese o elimine el JSON-LD en el HTML de producción.
- Imagen editorial o captura aprobada con `alt` descriptivo.

Evitar:

- paginas delgadas con solo enlaces.
- claims de seguridad no verificables.
- contenido duplicado entre herramientas.
- CTAs engañosos como "descargar ahora" si en realidad se redirige a otra web.

## Datos Que Conviene Agregar Al Modelo

El schema actual ya tiene base suficiente. Para enriquecer futuras fichas, considerar nuevos campos:

- `bestFor`: lista corta de casos de uso.
- `limitations`: limitaciones editoriales.
- `requirements`: requisitos por plataforma o generales.
- `faq`: preguntas y respuestas visibles.
- `editorialSummary`: resumen propio separado de `longDescription`.
- `editorialSections`: secciones largas unicas para SEO, Adsense y E-E-A-T.
- `initials`: iniciales editoriales para identificador visual propio.
- `screenshotUrl`: captura oficial aprobada, opcional.
- `logoPolicy`: `monogram`, `brand-inspired`, `official-asset-approved`.

No agregar capturas o logos oficiales sin revisar condiciones de uso de marca. Si no hay permiso claro, usar identificadores editoriales propios.

## Checklist Para Nuevas Fichas

1. El usuario entiende para que sirve la herramienta antes del primer scroll.
2. El CTA primario lleva a `/ir/` y explica destino oficial.
3. El selector de plataforma no mezcla web app con instaladores sin aclaracion.
4. Hay advertencias especificas si existen riesgos comunes.
5. Hay contenido editorial suficiente para evitar una pagina delgada.
6. Hay alternativas utiles.
7. La pagina funciona bien en mobile.
8. `editorialSections` son especificas de la herramienta y no texto duplicado.
9. `npm run build` pasa antes de publicar.
