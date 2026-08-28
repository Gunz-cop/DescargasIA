/**
 * Fuente única de verdad de la FORMA de las URLs internas y del enlazado.
 *
 * Ninguna página debe construir a mano una ruta interna (`/${lang}/algo`).
 * Si mañana cambia el patrón de URLs —prefijo de idioma, nombre del segmento
 * `categoria`, sección nueva— se cambia aquí y el sitio entero se recalcula.
 *
 * Ver `docs/enlazado-interno.md` para el porqué de cada decisión.
 */
import type { Lang } from './brand';

export const LANGS: Lang[] = ['es', 'sv', 'it'];

/**
 * Idioma que ocupa la raíz del sitio.
 *
 * ÚNICA asimetría del esquema de URLs, y es deliberada:
 *   portada ES  -> "/"            (NO "/es")
 *   resto de ES -> "/es/<slug>", "/es/categoria/<slug>", ...
 *   sv e it     -> "/sv/...", "/it/..." sin excepción
 *
 * Por qué: el canonical de la portada siempre fue `https://fuenteai.com`,
 * pero Astro generaba además `/es` (por `prefixDefaultLocale: true`) y TODOS
 * los enlaces internos apuntaban a `/es`. Resultado medido sobre el build:
 * la URL canónica del sitio tenía 0 enlaces entrantes y la duplicada 98.
 * Ahora `/es` no se genera y se redirige 301 a `/` (ver `public/_redirects`).
 *
 * Se mantiene `/` como portada —en vez de mover todo a `/es`— porque `/` es
 * la URL ya indexada y enlazada desde fuera: cambiarla obligaría a redirigir
 * la entrada principal del sitio sin ganar nada a cambio.
 */
export const ROOT_LANG: Lang = 'es';

/**
 * Prefijo de idioma para páginas internas. SIEMPRE lleva prefijo, incluido
 * el español: solo la portada es especial (ver `homeUrl`).
 */
export function langPrefix(lang: Lang): string {
  return `/${lang}`;
}

/** Portada del idioma. `/` en es; `/sv` y `/it` en los demás. */
export function homeUrl(lang: Lang): string {
  return lang === ROOT_LANG ? '/' : `/${lang}`;
}

/** Ficha de herramienta. */
export function toolUrl(lang: Lang, slug: string): string {
  return `${langPrefix(lang)}/${slug}`;
}

/** Tarjeta OG estática generada para una ficha de herramienta. */
export function toolOgImageUrl(origin: string, lang: Lang, slug: string): string {
  return absolute(origin, `/og/${lang}/${slug}.png`);
}

/**
 * Tarjeta OG de las páginas que no son ficha: portada, categorías y guías.
 * Hay una por idioma — son 43 de las 190 páginas del sitio, y compartir la
 * portada sueca con una tarjeta en español no sirve a nadie.
 */
export function defaultOgImageUrl(origin: string, lang: Lang): string {
  return absolute(origin, `/og/default-${lang}.png`);
}

/**
 * Página de categoría. El segmento `categoria` NO se traduce: mantenerlo
 * estable en los tres idiomas evita romper URLs ya indexadas y hace que el
 * mapeo hreflang entre idiomas sea 1:1 sin tabla de traducción de rutas.
 */
export const CATEGORY_SEGMENT = 'categoria';

export function categoryUrl(lang: Lang, slug: string): string {
  return `${langPrefix(lang)}/${CATEGORY_SEGMENT}/${slug}`;
}

/** Páginas estáticas (acerca-de, privacidad, ...). `slug` sin barra inicial. */
export function pageUrl(lang: Lang, slug: string): string {
  return `${langPrefix(lang)}/${slug}`;
}

/**
 * App "¿qué modelos de IA puedo correr?".
 *
 * El slug se mantiene en español en los tres idiomas, igual que `acerca-de` o
 * el segmento `categoria`: mantiene el mapeo hreflang 1:1 sin necesidad de una
 * tabla de traducción de rutas. Ver `docs/app-compatibilidad-ia.md`.
 */
export const HARDWARE_SLUG = 'puedo-correr-ia';

export function hardwareUrl(lang: Lang): string {
  return pageUrl(lang, HARDWARE_SLUG);
}

/**
 * Guías editoriales.
 *
 * El segmento `guias` NO se traduce, por la misma razón que `categoria`:
 * mantenerlo estable en los tres idiomas hace que el mapeo hreflang sea 1:1
 * sin tabla de traducción de rutas. Ver `docs/enlazado-interno.md`.
 *
 * A diferencia de la portada, las guías españolas SÍ llevan prefijo:
 * `/es/guias/...`, igual que `/es/<slug>`.
 */
export const GUIDES_SEGMENT = 'guias';

/** Índice de guías de un idioma. Solo se genera si ese idioma tiene guías. */
export function guideIndexUrl(lang: Lang): string {
  return `${langPrefix(lang)}/${GUIDES_SEGMENT}`;
}

/** Guía concreta. `slug` sin idioma y sin barra inicial. */
export function guideUrl(lang: Lang, slug: string): string {
  return `${langPrefix(lang)}/${GUIDES_SEGMENT}/${slug}`;
}

/** Ancla al directorio dentro de la portada del idioma. */
export function directoryUrl(lang: Lang): string {
  return lang === ROOT_LANG ? '/#directorio' : `/${lang}#directorio`;
}

/**
 * Interstitial de salida. Es `noindex` y multiplica URLs por querystring,
 * así que se enlaza siempre con `rel="nofollow"` y se bloquea en robots.txt:
 * no debe consumir presupuesto de rastreo ni recibir señal interna.
 */
export function redirectUrl(lang: Lang, slug: string, platform?: string): string {
  const params = new URLSearchParams({ t: slug });
  if (platform) params.set('p', platform);
  params.set('l', lang);
  return `/r?${params.toString()}`;
}

/** Convierte una ruta interna en absoluta para canonical, hreflang y JSON-LD. */
export function absolute(origin: string, pathname: string): string {
  return pathname === '/' ? origin : `${origin}${pathname}`;
}

export interface Alternate {
  lang: string;
  url: string;
}

/**
 * Construye las anotaciones hreflang de una página.
 *
 * Reglas que Google exige y que aquí se cumplen por construcción:
 *  - cada versión se lista A SÍ MISMA además de a las demás (self-reference);
 *  - la relación es bidireccional (todas las páginas usan este mismo helper);
 *  - `x-default` apunta a la versión del idioma raíz DE ESTA MISMA PÁGINA,
 *    no a la portada del sitio.
 *
 * `pathFor` devuelve la ruta en ese idioma, o `null` si la página no existe
 * traducida (una ficha sin traducir no debe declararse como alternativa).
 */
export function buildAlternates(
  origin: string,
  pathFor: (lang: Lang) => string | null
): Alternate[] {
  const alternates: Alternate[] = [];
  for (const lang of LANGS) {
    const path = pathFor(lang);
    if (path) alternates.push({ lang, url: absolute(origin, path) });
  }
  return alternates;
}
