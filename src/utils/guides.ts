/**
 * Acceso a la colección `guides`.
 *
 * Convención canónica del contenido:
 *
 *     src/content/guides/<lang>/<slug>.md
 *
 * El id que produce el loader glob recursivo ES la ruta relativa sin
 * extensión (`es/descargar-chatgpt-para-windows`), así que el idioma y el
 * slug se derivan de dónde vive el archivo, nunca del frontmatter. Es lo que
 * hace imposible que una guía escrita en español se publique bajo `/sv/`:
 * si no existe `src/content/guides/sv/<slug>.md`, no hay página sueca.
 *
 * Cualquier documento cuyo id no encaje en `<lang>/<slug>` con un idioma
 * conocido se descarta en silencio, igual que hace `getTranslatedTools()` con
 * una ficha sin traducir: no se infiere un idioma que no está declarado.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from './brand';
import { LANGS } from './links';
import { getTranslatedTools } from './tools';
import {
  getGuidesForTool,
  indexGuidesByTool,
  type GuideRef,
  type GuidesByTool
} from './guide-links';

export type GuideEntry = CollectionEntry<'guides'>;

export interface LocalizedGuide {
  entry: GuideEntry;
  lang: Lang;
  slug: string;
}

/** Parte un id de la colección en idioma + slug, o `null` si no es válido. */
export function parseGuideId(id: string): { lang: Lang; slug: string } | null {
  const segments = id.split('/').filter(Boolean);
  if (segments.length !== 2) return null;
  const [lang, slug] = segments;
  if (!(LANGS as string[]).includes(lang)) return null;
  return { lang: lang as Lang, slug };
}

/** Todas las guías localizadas que existen de verdad como archivo. */
export async function getLocalizedGuides(): Promise<LocalizedGuide[]> {
  const entries = await getCollection('guides');
  const guides: LocalizedGuide[] = [];

  for (const entry of entries) {
    const parsed = parseGuideId(entry.id);
    if (!parsed) continue;
    guides.push({ entry, lang: parsed.lang, slug: parsed.slug });
  }

  return guides;
}

/** Guías de un idioma, ordenadas de más reciente a más antigua. */
export async function getGuidesForLang(lang: Lang): Promise<LocalizedGuide[]> {
  const guides = await getLocalizedGuides();
  return guides
    .filter((guide) => guide.lang === lang)
    .sort((a, b) => guideDate(b).localeCompare(guideDate(a)));
}

/** Idiomas que tienen al menos una guía. El índice solo existe para ellos. */
export async function getLangsWithGuides(): Promise<Lang[]> {
  const guides = await getLocalizedGuides();
  return LANGS.filter((lang) => guides.some((guide) => guide.lang === lang));
}

/**
 * Idiomas en los que existe ESTE slug. Es la base del hreflang de una guía:
 * solo se declara alternativa la traducción que de verdad se genera.
 */
export async function getLangsForGuideSlug(slug: string): Promise<Lang[]> {
  const guides = await getLocalizedGuides();
  return LANGS.filter((lang) =>
    guides.some((guide) => guide.lang === lang && guide.slug === slug)
  );
}

/** Fecha efectiva de una guía: `lastUpdated` si existe, si no `datePublished`. */
export function guideDate(guide: LocalizedGuide): string {
  return guide.entry.data.lastUpdated ?? guide.entry.data.datePublished;
}

/**
 * Índice invertido guía -> ficha, construido una sola vez por build.
 *
 * Se memoiza porque lo consulta CADA ficha (unas 270 páginas entre los tres
 * idiomas) y recorrer la colección de guías y el catálogo traducido en cada
 * una sería tiempo de build regalado. Ver `src/utils/guide-links.ts` para las
 * dos formas de destino que se reconocen y por qué no hay ninguna más.
 */
let guidesByToolPromise: Promise<GuidesByTool> | null = null;

async function buildGuidesByToolIndex(): Promise<GuidesByTool> {
  const ordered: Array<{ lang: Lang; slug: string; title: string; body: string }> = [];

  for (const lang of LANGS) {
    // Ya vienen de más reciente a más antigua; ese orden se conserva dentro
    // de cada ficha, así que el bloque encabeza con la guía más nueva.
    for (const guide of await getGuidesForLang(lang)) {
      ordered.push({
        lang,
        slug: guide.slug,
        title: guide.entry.data.title,
        body: guide.entry.body ?? ''
      });
    }
  }

  const toolSlugsByLang: Partial<Record<Lang, string[]>> = {};
  for (const lang of LANGS) {
    toolSlugsByLang[lang] = (await getTranslatedTools(lang)).map((tool) => tool.slug);
  }

  return indexGuidesByTool(ordered, toolSlugsByLang);
}

/**
 * Guías del idioma `lang` que ya enlazan la ficha `toolSlug` en su Markdown.
 * Vacío si no hay ninguna: la ficha no renderiza el bloque en ese caso.
 */
export async function getGuidesLinkingTool(
  lang: Lang,
  toolSlug: string,
  limit = 4
): Promise<GuideRef[]> {
  guidesByToolPromise ??= buildGuidesByToolIndex();
  return getGuidesForTool(await guidesByToolPromise, lang, toolSlug, limit);
}

export type { GuideRef } from './guide-links';
