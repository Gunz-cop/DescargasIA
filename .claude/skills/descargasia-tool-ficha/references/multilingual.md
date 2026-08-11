# Multilingüe: cómo funciona hoy y cómo extenderlo

## La arquitectura ya soporta varios idiomas — el contenido no

`src/content.config.ts` define la colección `tools` con `loader: glob({ pattern: '**/*.json', base: './src/content/tools' })` — es decir, carga **recursivamente** cualquier carpeta de idioma dentro de `src/content/tools/`. El enrutamiento (`src/pages/[lang]/[slug].astro`), las categorías traducidas (`src/utils/brand.ts`, función `getCategoryLabel`) y los textos de UI (`src/i18n/ui.ts`) ya están preparados para `es`, `sv` (sueco) e `it` (italiano).

Lo que **no** está garantizado es que el contenido exista para todos los idiomas. Confirmá el estado real antes de asumir nada:

```bash
for l in es sv it; do echo "$l: $(ls src/content/tools/$l 2>/dev/null | wc -l)"; done
```

**Estado verificado en esta sesión** (agosto 2026, no confíes en este número indefinidamente, volvé a correr el comando de arriba): `es` tenía 51 fichas completas, `sv` tenía 23 (parte del catálogo original, ninguna de las agregadas después), `it` tenía 0 — la carpeta existe y el sitio genera sus páginas de categoría/home en italiano, pero sin ninguna ficha de herramienta todavía.

## Qué significa esto para agregar contenido en otro idioma

- **`tools-base/<slug>.json` es único por herramienta, no por idioma.** Si vas a agregar la ficha en sueco de una herramienta que ya existe en español, **no dupliques ni toques `tools-base/<slug>.json`** — ese archivo ya sirve para todos los idiomas. Solo creás `src/content/tools/sv/<slug>.json`.
- El contenido editorial (`shortDescription`, `editorialSections`, `faq`, etc.) tiene que redactarse en ese idioma con la misma calidad y las mismas reglas de `references/editorial-writing.md` — no es una traducción mecánica palabra por palabra, es contenido editorial propio en ese idioma, adaptado a cómo busca y qué le preocupa a un hablante de sueco o italiano (no asumas que las mismas frases de búsqueda en español aplican igual).
- Completá el campo `*Support` que corresponda (`swedishSupport` o `italianSupport`) en el JSON de ese idioma — es sobre si la herramienta soporta ese idioma humano, no sobre el idioma de la ficha (ver `references/schema-contract.md`).

## Si el usuario pide "poné al día sv/it con lo que agregamos en español"

Es un trabajo de traducción/localización editorial de las fichas que ya existen en `tools-base` pero les falta la contraparte en `tools/sv/` o `tools/it/` — no es descubrimiento de herramientas nuevas. El chequeo de `references/validation.md` (punto 1) adaptado a esa carpeta te muestra exactamente qué slugs faltan.

No completes ese trabajo salvo que el usuario lo pida explícitamente — no asumas que "crear una ficha nueva" implica automáticamente crearla en los tres idiomas.
