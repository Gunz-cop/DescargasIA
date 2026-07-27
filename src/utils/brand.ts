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
  /** Descripción larga mostrada en la cabecera de la página de categoría */
  description: Trilingual;
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
    },
    description: {
      es: 'Chatbots interactivos y asistentes virtuales inteligentes para responder preguntas, redactar textos y organizar tareas diarias.',
      sv: 'Interaktiva chattbottar och intelligenta virtuella assistenter för att svara på frågor, skriva texter och organisera dagliga uppgifter.',
      it: 'Chatbot interattivi e assistenti virtuali intelligenti per rispondere a domande, scrivere testi e organizzare le attività quotidiane.'
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
    },
    description: {
      es: 'Herramientas de IA y editores de código diseñados para escribir, depurar, autocompletar y refactorizar software de forma asistida.',
      sv: 'AI-verktyg och kodredigerare för att skriva, felsöka, autokomplettera och refaktorera programvara med assisterad hjälp.',
      it: 'Strumenti IA ed editor di codice progettati per scrivere, eseguire il debug, completare automaticamente e rifattorizzare software in modo assistito.'
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
    },
    description: {
      es: 'Software y plataformas para ejecutar modelos de inteligencia artificial de código abierto de forma 100% local y privada en tu PC.',
      sv: 'Programvara och plattformar för att köra AI-modeller med öppen källkod helt lokalt och privat på din dator.',
      it: 'Software e piattaforme per eseguire modelli di intelligenza artificiale open source in modo 100% locale e privato sul tuo PC.'
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
    },
    description: {
      es: 'Herramientas de IA para crear, editar y transformar imágenes, ilustraciones y arte digital a partir de descripciones de texto.',
      sv: 'AI-verktyg för att skapa, redigera och omvandla bilder, illustrationer och digital konst utifrån textbeskrivningar.',
      it: 'Strumenti IA per creare, modificare e trasformare immagini, illustrazioni e arte digitale a partire da descrizioni testuali.'
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
    },
    description: {
      es: 'Herramientas de IA para crear, editar, animar y procesar videos a partir de texto, imágenes o plantillas automáticas.',
      sv: 'AI-verktyg för att skapa, redigera, animera och bearbeta video utifrån text, bilder eller automatiska mallar.',
      it: 'Strumenti IA per creare, modificare, animare ed elaborare video a partire da testo, immagini o modelli automatici.'
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
    },
    description: {
      es: 'Herramientas de inteligencia artificial para generar canciones completas, pistas instrumentales y efectos de sonido originales libres de regalías.',
      sv: 'AI-verktyg för att generera hela låtar, instrumentala spår och originella ljudeffekter fria från royalties.',
      it: 'Strumenti di intelligenza artificiale per generare canzoni complete, tracce strumentali ed effetti sonori originali senza royalty.'
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
    },
    description: {
      es: 'Herramientas de IA diseñadas para corregir textos, optimizar el estilo y traducir documentos con precisión semántica y naturalidad.',
      sv: 'AI-verktyg utformade för att korrigera texter, förbättra stilen och översätta dokument med semantisk precision och naturligt språk.',
      it: 'Strumenti IA progettati per correggere testi, ottimizzare lo stile e tradurre documenti con precisione semantica e naturalezza.'
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
    },
    description: {
      es: 'Herramientas de IA para automatizar la creación de diapositivas, organizar flujos de trabajo y generar documentos profesionales en segundos.',
      sv: 'AI-verktyg för att automatisera skapandet av bilder, organisera arbetsflöden och generera professionella dokument på sekunder.',
      it: 'Strumenti IA per automatizzare la creazione di diapositive, organizzare i flussi di lavoro e generare documenti professionali in pochi secondi.'
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
