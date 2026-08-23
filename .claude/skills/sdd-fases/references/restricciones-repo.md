# Restricciones fijas de FuenteAI que toda fase debe respetar

Esto es lo que hoy cada sesión nueva redescubre a mano. **Verificalo contra el código al empezar**: si algo no coincide, gana el código y actualizá este archivo.

## Compuertas que rompen el build (y con él, el deploy)

`npm run build` encadena `catalog:audit` → `astro build` → `links:audit`. Las dos auditorías salen con código 1 y matan el deploy.

`scripts/audit-internal-links.mjs` corre sobre `dist/` y falla con error duro si:

1. hay un enlace interno roto, o que apunta a una entrada de `public/_redirects`;
2. **una página indexable tiene 0 enlaces entrantes** ("página HUÉRFANA"). Toda página nueva debe enlazarse desde `BaseLayout` (nav desktop **y** menú móvil) o desde otra página, **en el mismo PR que la crea**;
3. falta el `<link rel="canonical">` o no es autorreferencial;
4. el hreflang no es autorreferencial y **recíproco** entre los tres idiomas → usá siempre `buildAlternates` de `src/utils/links.ts`, y publicá `es`, `sv` e `it` a la vez;
5. un `<a>` a `/r` no lleva `rel="nofollow"`.

`scripts/audit-catalog.mjs` valida integridad del contenido: fichas sin traducir, slugs de `alternatives` inexistentes, categorías fantasma, cobertura mínima por categoría.

## Reglas de arquitectura

- **Regla de oro (`AGENTS.md`): ninguna ruta interna se escribe a mano.** Todo enlace sale de los helpers de `src/utils/links.ts` (`homeUrl`, `toolUrl`, `categoryUrl`, `pageUrl`, `buildAlternates`). Una página nueva agrega su propio helper ahí.
- **`output: 'static'`.** No hay runtime de servidor por defecto. Si una fase necesita backend, la vía de menor riesgo es agregar `main` al `wrangler.jsonc` existente y delegar todo lo que no sea `/api/*` a `env.ASSETS` — no migrar el sitio a SSR.
- **Sin islas de framework.** No hay React/Vue/Svelte y no se introducen. La interactividad es JS vanilla en un `<script>` al pie del `.astro`; el patrón de referencia es `src/components/Directory.astro` (estado en objeto, `apply()`, `history.replaceState`, `aria-pressed`, `aria-live`).
- **`is:inline` solo cuando hace falta pasar datos del servidor** con `define:vars` (patrón de `src/pages/r/index.astro`). Si no, `<script>` normal para que Astro lo empaquete y lo tipe.
- **Todo lo que deba correr en cliente y en servidor va en TS puro** (sin DOM, sin imports de Astro, sin `import.meta.env`), para poder importarlo desde ambos lados y testearlo con `node --test`.

## Reglas de UI

- Tailwind v4 **sin config JS**: los tokens viven en `@theme` dentro de `src/styles/global.css`. Usá `fai-*` en trabajo nuevo; `brand-*` es alias heredado.
- **Sitio solo oscuro** (`color-scheme: dark`). No agregues toggle de tema; el `localStorage.theme` que hay en `/r` es código muerto.
- Mobile-first, según `docs/design-system.md`: objetivos táctiles ≥ 44 px, nada por debajo de 14 px en móvil, inputs a 16 px (para no disparar el zoom de iOS), rama `prefers-reduced-motion` en toda animación, y un estado `.no-js` que nunca esconda contenido.
- No existen componentes de tooltip ni de combobox: quien los necesite los construye, y conviene que queden reutilizables.

## Reglas de contenido e i18n

- Tres idiomas: `es` (raíz, la portada es `/` y no `/es`), `sv`, `it`. Definidos en `astro.config.mjs`, `src/i18n/ui.ts` y `LANGS` de `src/utils/links.ts` — los tres tienen que quedar sincronizados.
- Etiquetas cortas en `src/i18n/ui.ts`; prosa larga con ternario `lang === 'sv' ? … : lang === 'it' ? … : …`, como en `Home.astro`.
- **Las tres tablas de `ui.ts` deben tener el mismo conjunto de claves.** El fallback es solo en runtime: si `sv`/`it` pierden una clave, los tipos derivan sin avisar. Conviene un test de paridad.
- Slugs de página: se mantienen **en español en los tres idiomas** (`acerca-de`, `aviso-legal`, y el segmento `categoria`). Es deliberado: mantiene el mapeo hreflang 1:1 sin tabla de traducción de rutas.
- Autoría siempre `Organization` desde `src/data/editorial-team.ts`, nunca `Person`.

## Otros

- Si una página usa query params, agregalos al bloque de `Disallow` de `public/robots.txt` (precedente: `?q=`, `?cat=`, `?plat=`, `?precio=`).
- No hay analítica de ningún tipo. La monetización es Adsterra vía `src/components/AdSlot.astro`, que reserva altura fija para no mover el layout.
- No hay linter, formateador ni typecheck en `package.json`. Si una fase agrega tests, el script `test` se encadena en `build` para que sea compuerta real.
