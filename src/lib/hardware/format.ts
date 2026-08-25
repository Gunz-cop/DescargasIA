/**
 * Presentación de los números del motor. F2 — docs/fases/F2.md.
 *
 * Existe para que la cifra se escriba igual en la página, en la tarjeta de
 * resultado y en la tabla sin JS. Aquí no se calcula nada: se redondea y se
 * localiza lo que ya decidió `estimate.ts`.
 *
 * TypeScript puro: sin DOM, sin Astro, sin variables de entorno.
 */

import type { Estimate } from './types';

/** Un gigabyte binario. Las capacidades de memoria se anuncian así. */
export const BYTES_PER_GIB = 1024 ** 3;

const LOCALES = {
  es: 'es-ES',
  sv: 'sv-SE',
  it: 'it-IT'
} as const;

export type FormatLang = keyof typeof LOCALES;

function localeOf(lang: string | undefined): string {
  if (lang && Object.prototype.hasOwnProperty.call(LOCALES, lang)) {
    return LOCALES[lang as FormatLang];
  }
  return LOCALES.es;
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function number(value: number, lang: string | undefined, decimals: number): string {
  return new Intl.NumberFormat(localeOf(lang), {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(round(value, decimals));
}

/**
 * Bytes → "4,9 GB". Un decimal por debajo de 100 GB y ninguno por encima:
 * "42,5 GB" informa, "127,3 GB" solo aparenta precisión.
 */
export function formatGb(bytes: number, lang: string = 'es'): string {
  const gib = bytes / BYTES_PER_GIB;
  const decimals = gib >= 100 ? 0 : gib >= 10 ? 1 : gib >= 1 ? 1 : 2;
  return `${number(gib, lang, decimals)} GB`;
}

/**
 * Rango de tok/s → "28–43 tok/s". Nunca una cifra única: el método (roofline
 * de ancho de banda) no sostiene esa precisión, y quien lo muestre está
 * obligado a rotularlo como estimación.
 *
 * Devuelve cadena vacía si no hay ancho de banda conocido: mejor no enseñar
 * nada que inventar una velocidad.
 */
export function formatTps(range: { min: number; max: number }, lang: string = 'es'): string {
  if (!(range.max > 0)) return '';
  const decimals = range.max < 10 ? 1 : 0;
  const min = number(range.min, lang, decimals);
  const max = number(range.max, lang, decimals);
  return min === max ? `~${max} tok/s` : `${min}–${max} tok/s`;
}

/** Cuánto de la memoria disponible se lleva el modelo, para la barra apilada. */
export function formatUsage(estimate: Estimate, lang: string = 'es'): string {
  return `${formatGb(estimate.memory.total, lang)} / ${formatGb(estimate.available, lang)}`;
}

/** Contexto en tokens → "32k". Es como lo nombran las fichas y los runtimes. */
export function formatContext(tokens: number): string {
  if (tokens >= 1024 && tokens % 1024 === 0) return `${tokens / 1024}k`;
  if (tokens >= 1000) return `${Math.round(tokens / 1000)}k`;
  return String(tokens);
}
