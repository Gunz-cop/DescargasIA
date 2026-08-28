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
