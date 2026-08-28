/**
 * Formatea una fecha según el idioma
 */
export function formatDate(dateString: string, lang: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(lang, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}