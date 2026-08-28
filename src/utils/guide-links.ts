/**
 * Inversión de la relación guía -> ficha (F5.1, #85; resuelve #83 por la vía A).
 *
 * El problema: cada guía enlaza HACIA fichas y categorías, y ninguna de ellas
 * devolvía el enlace. Las cinco guías publicadas recibían un único entrante,
 * el de su índice, que solo se enlaza desde la cabecera —boilerplate—. Ver
 * `docs/mejora/blockers/F5-bloqueo-descubrimiento-de-guias.md` y #83.
 *
 * La solución NO declara la relación en ningún sitio nuevo: la deriva del
 * Markdown que la guía ya publica. Eso descarta inventar contenido, tocar el
 * frontmatter de F4 y añadir un `alternatives` por idioma.
 *
 * Dos formas de destino se reconocen, y solo dos. Ambas son exactas: o el
 * destino ES la ruta de una ficha existente, o declara su slug en un
 * parámetro con nombre. No hay coincidencia por título, por `tags`, por
 * `category` ni por texto libre — una heurística así produciría relaciones
 * que nadie escribió.
 *
 *   1. `/<lang>/<slug>`  — la forma que produce `toolUrl(lang, slug)`.
 *      Tres segmentos (`/sv/categoria/…`, `/sv/guias/…`) no encajan, y un
 *      slug de dos segmentos que no está en el catálogo (`/es/acerca-de`) se
 *      descarta al contrastarlo contra las fichas traducidas de ese idioma.
 *   2. `/r?t=<slug>&…&l=<lang>` — la forma que produce `redirectUrl()`. Es el
 *      botón de descarga dentro del cuerpo de la guía y declara la
 *      herramienta de forma explícita. Aquí solo se LEE; `/r` no se toca.
 *
 * En los dos casos el idioma del destino debe coincidir con el idioma de la
 * CARPETA de la guía (`src/content/guides/<lang>/`, ver `guides.ts`). Es lo
 * que impide que una ficha sueca acabe enlazando una guía española: no se
 * cruzan productos ni idiomas en ningún punto del índice.
 *
 * Todo el módulo es puro y sin dependencias de `astro:content`, para que
 * `tests/guias-fichas.test.ts` pueda ejercitarlo sin build.
 */
import type { Lang } from './brand';
import { LANGS } from './links';

/** Guía localizada reducida a lo que hace falta para invertir la relación. */
export interface GuideSource {
  lang: Lang;
  slug: string;
  title: string;
  /** Cuerpo Markdown tal cual lo publica la colección (`entry.body`). */
  body: string;
}

/** Entrada del bloque de la ficha: título y slug reales de la colección. */
export interface GuideRef {
  slug: string;
  title: string;
}

/** Índice invertido, separado por idioma: idioma -> slug de ficha -> guías. */
export type GuidesByTool = Map<Lang, Map<string, GuideRef[]>>;

/**
 * Destinos de enlace declarados en un cuerpo Markdown: enlaces en línea,
 * definiciones de referencia y `href` de HTML embebido. No se interpreta el
 * texto del ancla, solo el destino.
 */
export function extractLinkTargets(body: string): string[] {
  const targets: string[] = [];

  const inline = /\]\(\s*<?([^)<>\s]+)>?(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*\)/g;
  const reference = /^[ \t]{0,3}\[[^\]]+\]:[ \t]*<?([^\s<>]+)>?/gm;
  const html = /\shref\s*=\s*["']([^"']+)["']/g;

  for (const pattern of [inline, reference, html]) {
    for (const match of body.matchAll(pattern)) {
      if (match[1]) targets.push(match[1]);
    }
  }

  return targets;
}

/**
 * Slug de ficha que declara un destino, o `null` si el destino no es una de
 * las dos formas reconocidas o pertenece a otro idioma.
 *
 * No comprueba que el slug exista: de eso se encarga `extractToolSlugs()`
 * contra el catálogo real, que es el único sitio donde vive esa verdad.
 */
export function toolSlugFromTarget(target: string, lang: Lang): string | null {
  if (!target.startsWith('/')) return null;

  const [path, query = ''] = target.split('#')[0].split('?');

  // 2. `/r?t=<slug>&p=<plataforma>&l=<lang>`
  if (path === '/r' || path === '/r/') {
    const params = new URLSearchParams(query);
    const slug = params.get('t');
    if (!slug) return null;
    if (params.get('l') !== lang) return null;
    return slug;
  }

  // 1. `/<lang>/<slug>` — exactamente dos segmentos y sin querystring.
  if (query) return null;
  const segments = path.split('/').filter(Boolean);
  if (segments.length !== 2) return null;
  const [targetLang, slug] = segments;
  if (!(LANGS as string[]).includes(targetLang)) return null;
  if (targetLang !== lang) return null;
  return slug;
}

/**
 * Slugs de ficha que una guía declara en su propio idioma, en el orden en que
 * aparecen en el cuerpo, sin repetir y filtrados contra el catálogo traducido
 * de ese idioma. Un slug que no existe como ficha nunca sale de aquí, así que
 * es imposible generar un enlace a una ruta inexistente.
 */
export function extractToolSlugs(guide: GuideSource, knownToolSlugs: Iterable<string>): string[] {
  const known = knownToolSlugs instanceof Set ? knownToolSlugs : new Set(knownToolSlugs);
  const found: string[] = [];
  const seen = new Set<string>();

  for (const target of extractLinkTargets(guide.body)) {
    const slug = toolSlugFromTarget(target, guide.lang);
    if (!slug || seen.has(slug) || !known.has(slug)) continue;
    seen.add(slug);
    found.push(slug);
  }

  return found;
}

/**
 * Invierte la relación de una lista de guías ya ordenada (más reciente
 * primero, como devuelve `getGuidesForLang()`): el orden de entrada se
 * conserva dentro de cada ficha.
 *
 * `toolSlugsByLang` es el catálogo traducido de cada idioma. Un idioma que no
 * figure ahí no produce ninguna relación: sin fichas no hay dónde enlazar.
 */
export function indexGuidesByTool(
  guides: GuideSource[],
  toolSlugsByLang: Partial<Record<Lang, Iterable<string>>>
): GuidesByTool {
  const known = new Map<Lang, Set<string>>();
  for (const lang of LANGS) {
    known.set(lang, new Set(toolSlugsByLang[lang] ?? []));
  }

  const index: GuidesByTool = new Map(LANGS.map((lang) => [lang, new Map<string, GuideRef[]>()]));

  for (const guide of guides) {
    const byTool = index.get(guide.lang);
    if (!byTool) continue;

    for (const slug of extractToolSlugs(guide, known.get(guide.lang) ?? new Set())) {
      const list = byTool.get(slug) ?? [];
      // Una guía no puede aparecer dos veces bajo la misma ficha: el slug de
      // la guía es único dentro de su idioma (es su nombre de archivo).
      if (list.some((ref) => ref.slug === guide.slug)) continue;
      list.push({ slug: guide.slug, title: guide.title });
      byTool.set(slug, list);
    }
  }

  return index;
}

/**
 * Guías que la ficha `toolSlug` debe mostrar en `lang`. Lista vacía si no hay
 * ninguna: la ficha usa eso para no renderizar un bloque vacío.
 */
export function getGuidesForTool(
  index: GuidesByTool,
  lang: Lang,
  toolSlug: string,
  limit = 4
): GuideRef[] {
  const refs = index.get(lang)?.get(toolSlug) ?? [];
  return refs.slice(0, limit);
}
