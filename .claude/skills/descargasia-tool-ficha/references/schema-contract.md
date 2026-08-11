# Schema Contract

Esta es la descripción del schema **al momento de escribir esta skill** (agosto 2026), tomada directamente de `src/content.config.ts`. Si notás una diferencia entre este archivo y `content.config.ts`, el archivo real gana siempre — actualizá esta referencia después.

Las fichas viven separadas en dos colecciones, no en un solo archivo:

## `src/content/tools-base/<slug>.json` — datos técnicos, compartidos entre idiomas

Un solo archivo por herramienta, independiente del idioma. Si mañana agregás la ficha en sueco de una herramienta que ya existe en español, **no dupliques este archivo** — solo agregás `src/content/tools/sv/<slug>.json`.

```json
{
  "name": "Nombre del producto",
  "officialWebsite": "https://ejemplo.com",
  "categories": ["asistentes-ia"],
  "platforms": {
    "web": { "url": "https://...", "type": "web-app", "isOfficial": true, "lastChecked": "YYYY-MM-DD" },
    "windows": { "...": "..." },
    "mac": { "...": "..." },
    "linux": { "...": "..." },
    "android": { "...": "..." },
    "ios": { "...": "..." }
  },
  "pricingModel": "free | freemium | paid | enterprise | unknown",
  "requiresAccount": true,
  "tags": ["tag1", "tag2"],
  "alternatives": ["slug-existente-1", "slug-existente-2"],
  "screenshotUrl": null,
  "initials": "ABC",
  "trustLevel": "official | verified | pending-review",
  "lastReviewed": "YYYY-MM-DD",
  "officialSources": ["https://..."]
}
```

Notas de campo:

- `platforms`: incluí solo las que existen de verdad. Cada plataforma es opcional independientemente.
- `platforms.*.type` enum válido: `official-site`, `app-store`, `web-app`, `documentation`, `official-installer`, `github-repo`, `package-manager`. Usá `documentation` cuando la ruta correcta de "descarga" es una guía de instalación (típico en herramientas que se instalan por pip/Docker/git clone, ej. Open WebUI, o parte del catálogo de Hugging Face). Usá `official-site` cuando no tenés el ID exacto de una app store pero sí una página oficial que enlaza a las tiendas correctas (evita inventar un ID de app que no pudiste confirmar).
- `requiresAccount`: es `boolean | "unknown"`, no solo boolean.
- `trustLevel`: `official` = fuente/tienda oficial directa; `verified` = proyecto open source de confianza sin un único vendor claro; `pending-review` = existe pero falta verificar mejor.
- `categories`: array — la mayoría de las fichas usan una sola, pero herramientas que cruzan dos mundos (ej. ComfyUI o InvokeAI, que son generación de imágenes Y ejecución local) pueden llevar dos categorías (`["generacion-imagenes", "modelos-locales"]`), como ya hace `stable-diffusion.json`.

## `src/content/tools/<lang>/<slug>.json` — contenido editorial, específico por idioma

`<lang>` es una carpeta por idioma: `es`, `sv`, `it` existen hoy en el repo (ver `references/multilingual.md` para el estado real de cobertura de cada una — no son simétricas).

```json
{
  "shortDescription": "Máximo 180 caracteres.",
  "longDescription": "Descripción más completa, en prosa.",
  "bestFor": ["caso de uso 1", "caso de uso 2", "caso de uso 3", "caso de uso 4"],
  "limitations": ["limitación 1", "limitación 2", "limitación 3"],
  "safetyNotes": ["advertencia concreta 1", "advertencia concreta 2"],
  "editorialSummary": "Un párrafo, resumen editorial propio (no repite longDescription).",
  "editorialSections": [
    { "heading": "Título específico de la sección", "body": "Dos párrafos separados por \\n\\n." }
  ],
  "faq": [
    { "question": "¿...?", "answer": "Respuesta concisa." }
  ],
  "spanishSupport": "yes | partial | no | unknown",
  "swedishSupport": "yes | partial | no | unknown",
  "italianSupport": "yes | partial | no | unknown"
}
```

Notas de campo:

- Los tres campos `*Support` son sobre si **la herramienta en sí** soporta ese idioma humano (ej. si Grammarly corrige texto en español), no sobre en qué idioma está escrita la ficha — eso lo determina la carpeta (`tools/es/`, `tools/sv/`, `tools/it/`). Completá el que corresponda al idioma de esa ficha específica; los otros dos son opcionales.
- `editorialSections`: 3-5 secciones, cada una con encabezado específico de la herramienta (no genérico) y dos párrafos con al menos una decisión o advertencia concreta.
- `faq`: 4 preguntas apuntando a intención de búsqueda real (ver `references/editorial-writing.md`).

## Categorías vigentes

Mirá siempre `src/content/categories/*.json` para la lista actual — no la copies de memoria, puede haber crecido. Al momento de esta skill había 8: `asistentes-ia`, `programacion`, `modelos-locales`, `generacion-imagenes`, `video-ia`, `musica-ia`, `traduccion-redaccion-ia`, `productividad-presentaciones-ia`.

## Reglas de integridad

- `alternatives` debe apuntar a slugs que existen en `src/content/tools-base/`. Si la alternativa no existe todavía, omitíla o creá esa ficha también — nunca la dejes apuntando a un slug inexistente.
- Todo slug en `tools-base/` necesita su contraparte en al menos `tools/es/` (mínimo, para que la ficha sea navegable en el idioma principal del sitio). Ver `references/validation.md` para el chequeo automatizado.
