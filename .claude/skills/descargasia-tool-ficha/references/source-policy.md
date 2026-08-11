# Source Policy

## Destinos oficiales aprobados

Usá estos destinos cuando sean realmente oficiales:

- dominio oficial del producto;
- dominio de documentación oficial;
- organización/repositorio oficial en GitHub;
- ficha de Google Play publicada por el desarrollador oficial;
- ficha de App Store publicada por el desarrollador oficial;
- ficha de Microsoft Store publicada por el desarrollador oficial;
- VS Code Marketplace o JetBrains Marketplace para extensiones oficiales;
- documentación del gestor de paquetes cuando esa es la ruta oficial de instalación (pip, npm, Docker).

## Hugging Face como fuente

Hugging Face es un caso especial que vale la pena aclarar porque es tentador usarlo mal:

- **Como señal de descubrimiento de tendencias**: sí, está bien. Ver `references/workflow.md`.
- **Como destino oficial de enlace**: solo cuando el repo/modelo pertenece a la organización verificada de la marca (ej. el org oficial de una compañía en HF), igual que usarías su GitHub oficial. No enlaces a un modelo subido por una cuenta individual sin relación clara con la marca.
- **Como fuente de texto para redactar la ficha**: nunca. Copiar o parafrasear de cerca una model card ajena genera contenido no original — exactamente lo que este catálogo evita, y lo que Google penaliza.

## Evitar

- APKPure/APKMirror y otros portales de APK;
- portales de descarga estilo Softonic;
- forks de GitHub reposteados que no son el proyecto upstream real;
- instaladores "portables" de sitios desconocidos;
- builds crackeadas, desbloqueadas, "premium gratis", modificadas o parcheadas;
- páginas SEO que solo envuelven (iframe) la app oficial.

## Niveles de confianza

- `official`: fuente oficial directa del producto o ficha de tienda oficial.
- `verified`: proyecto open source/upstream de confianza o ruta de instalación reconocida, especialmente cuando no hay un único vendor con descarga centralizada.
- `pending-review`: existe una entrada útil pero el estado oficial o la disponibilidad por plataforma necesita más verificación.

## Cuando no hay instalador

Si una herramienta no tiene instalador de escritorio, decilo en:

- `limitations`;
- `editorialSummary`;
- al menos un bloque de `editorialSections`;
- FAQ;
- `safetyNotes`.

Ejemplos ya documentados en el catálogo:

- Midjourney: sin instalador de escritorio independiente; flujo web/Discord.
- GitHub Copilot: extensión/integración, no un editor independiente.
- Perplexity: web/app/tienda/PWA; evitar instaladores de escritorio genéricos.
- Runway/Luma: herramientas web en la nube, no editores de video de escritorio clásicos.
- Ideogram: sin app oficial confirmada en Android, solo iOS + web.
- Open WebUI: no tiene instalador tradicional, se despliega vía Docker o pip.
- Hugging Face: no es una app instalable, es la plataforma/catálogo detrás de otras herramientas (Ollama, LM Studio, GPT4All).

## Cuando no podés confirmar un dato puntual (ID de app, paquete de Android)

No inventes el número. Si tras un par de búsquedas cruzadas no aparece un ID consistente y confiable:

1. Usá la página oficial de descargas de la marca como URL (`type: "official-site"`), que ya enlaza correctamente a cada tienda.
2. O simplemente omití esa plataforma de `platforms` — es preferible una ficha con menos plataformas listadas pero todas verificadas, a una con una plataforma inventada que puede llevar a un enlace roto o, peor, a una app equivocada.
