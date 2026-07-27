/**
 * Metadatos compartidos del directorio: necesidades (categorías),
 * plataformas y utilidades de dominio, fecha e iniciales.
 *
 * El color por herramienta ya no vive aquí: en la dirección "Señal nocturna"
 * el avatar sólo tiene dos estados (hallazgo / conocida) y los define el CSS
 * (`.fai-avatar--find`, `.fai-avatar--known`). El `tone` de cada categoría se
 * conserva porque marca los chips de necesidad.
 */

export type Lang = 'es' | 'sv' | 'it';
export type PlatformKey = 'web' | 'windows' | 'mac' | 'linux' | 'android' | 'ios';

type Trilingual = Record<Lang, string>;

export interface CategoryMeta {
  slug: string;
  tone: string;
  label: Trilingual;
  /** Etiqueta corta para chips y navegación */
  short: Trilingual;
  blurb: Trilingual;
}

/** Categorías del directorio, en el orden en que deben mostrarse. */
export const CATEGORIES: CategoryMeta[] = [
  {
    slug: 'asistentes-ia',
    tone: '#2f8f6b',
    label: { es: 'Asistentes IA', sv: 'AI-assistenter', it: 'Assistenti IA' },
    short: { es: 'Asistentes', sv: 'Assistenter', it: 'Assistenti' },
    blurb: {
      es: 'Chatbots y asistentes conversacionales',
      sv: 'Chattbottar och assistenter',
      it: 'Chatbot e assistenti conversazionali'
    }
  },
  {
    slug: 'programacion',
    tone: '#3b7fc4',
    label: { es: 'Programación', sv: 'Programmering', it: 'Programmazione' },
    short: { es: 'Programación', sv: 'Programmering', it: 'Programmazione' },
    blurb: {
      es: 'Editores, copilotos y herramientas dev',
      sv: 'Editorer, copiloter och dev-verktyg',
      it: 'Editor, copilot e strumenti dev'
    }
  },
  {
    slug: 'modelos-locales',
    tone: '#b07a2a',
    label: { es: 'Modelos locales', sv: 'Lokala modeller', it: 'Modelli locali' },
    short: { es: 'Modelos locales', sv: 'Lokala modeller', it: 'Modelli locali' },
    blurb: {
      es: 'Ejecutar modelos en tu propio equipo',
      sv: 'Kör modeller på din egen dator',
      it: 'Eseguire modelli sul tuo computer'
    }
  },
  {
    slug: 'generacion-imagenes',
    tone: '#a855a8',
    label: { es: 'Generación de imágenes', sv: 'Bildgenerering', it: 'Generazione immagini' },
    short: { es: 'Imagen', sv: 'Bild', it: 'Immagini' },
    blurb: {
      es: 'Crear y editar imágenes con IA',
      sv: 'Skapa och redigera bilder med AI',
      it: 'Creare e modificare immagini con IA'
    }
  },
  {
    slug: 'video-ia',
    tone: '#2c8fa8',
    label: { es: 'Vídeo IA', sv: 'AI-video', it: 'Video IA' },
    short: { es: 'Vídeo', sv: 'Video', it: 'Video' },
    blurb: {
      es: 'Generar y editar vídeo con IA',
      sv: 'Generera och redigera video med AI',
      it: 'Generare e modificare video con IA'
    }
  },
  {
    slug: 'musica-ia',
    tone: '#7a6bd1',
    label: { es: 'Música y sonido', sv: 'Musik och ljud', it: 'Musica e suono' },
    short: { es: 'Música', sv: 'Musik', it: 'Musica' },
    blurb: {
      es: 'Voz, música y efectos de sonido',
      sv: 'Röst, musik och ljudeffekter',
      it: 'Voce, musica ed effetti sonori'
    }
  },
  {
    slug: 'traduccion-redaccion-ia',
    tone: '#6b8a2e',
    label: { es: 'Traducción y redacción', sv: 'Översättning och skrivande', it: 'Traduzione e scrittura' },
    short: { es: 'Traducción', sv: 'Översättning', it: 'Traduzione' },
    blurb: {
      es: 'Traducir, corregir y redactar textos',
      sv: 'Översätt, korrigera och skriv text',
      it: 'Tradurre, correggere e scrivere testi'
    }
  },
  {
    slug: 'productividad-presentaciones-ia',
    tone: '#c2557a',
    label: { es: 'Productividad', sv: 'Produktivitet', it: 'Produttività' },
    short: { es: 'Productividad', sv: 'Produktivitet', it: 'Produttività' },
    blurb: {
      es: 'Documentos, presentaciones y notas',
      sv: 'Dokument, presentationer och anteckningar',
      it: 'Documenti, presentazioni e note'
    }
  }
];

const CATEGORY_BY_SLUG = new Map(CATEGORIES.map((cat) => [cat.slug, cat]));

export function getCategory(slug: string): CategoryMeta | undefined {
  return CATEGORY_BY_SLUG.get(slug);
}

export function getCategoryLabel(slug: string, lang: Lang, variant: 'label' | 'short' = 'label'): string {
  const cat = CATEGORY_BY_SLUG.get(slug);
  if (!cat) return slug;
  return cat[variant][lang] ?? cat[variant].es;
}

/** Iniciales editoriales para el avatar de la tarjeta. */
export function getInitials(name: string, explicit?: string): string {
  if (explicit) return explicit;
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

/** Host limpio de una URL, sin `www.`. Nunca lanza. */
export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return (url ?? '').replace(/^https?:\/\/(www\.)?/, '').split('/')[0] ?? '';
  }
}

/** Orden canónico de plataformas en toda la interfaz. */
export const PLATFORM_ORDER: PlatformKey[] = ['web', 'windows', 'mac', 'linux', 'android', 'ios'];

/** Etiqueta corta de plataforma (chips, listas compactas). */
export const PLATFORM_SHORT: Record<PlatformKey, string> = {
  web: 'Web',
  windows: 'Windows',
  mac: 'macOS',
  linux: 'Linux',
  android: 'Android',
  ios: 'iOS'
};

/** Fecha corta y localizada; devuelve null si no hay dato válido. */
export function formatDate(value: string | undefined, lang: Lang, long = false): string | null {
  if (!value) return null;
  const locale = lang === 'es' ? 'es-ES' : lang === 'sv' ? 'sv-SE' : 'it-IT';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(
    locale,
    long ? { day: 'numeric', month: 'long', year: 'numeric' } : { month: 'short', year: 'numeric' }
  );
}
