/**
 * Representación del catálogo pensada para agentes, no para navegadores.
 *
 * Todo lo que un agente lee del sitio —`/llms.txt`, `/api/catalog.json`, el
 * espejo Markdown de `/md/**`, las herramientas del servidor MCP— sale de
 * aquí. Es deliberado: si la ficha renderizada y la que lee el agente se
 * construyen por caminos distintos, divergen a la primera edición y el agente
 * empieza a citar datos que la página ya no dice.
 *
 * Ver `docs/agent-readiness.md`.
 */
import { CATEGORIES, type Lang } from './brand';
import { CATEGORY_SEGMENT, LANGS, homeUrl, toolUrl, categoryUrl, pageUrl } from './links';
import { getTranslatedTools, type ToolMerged } from './tools';

export const SITE_ORIGIN = 'https://fuenteai.com';
export const SITE_NAME = 'FuenteAI';

/**
 * Qué es el sitio, en una frase por idioma. Es la primera línea que lee un
 * agente y la que decide si el resto le sirve, así que dice el alcance real
 * (directorio de enlaces oficiales) y el límite (no aloja archivos).
 */
export const SITE_SUMMARY: Record<Lang, string> = {
  es: 'Directorio editorial de herramientas de IA que enlaza únicamente a canales oficiales de descarga y uso. FuenteAI no aloja instaladores, APKs, ejecutables ni mirrors: cada ficha apunta al sitio, tienda, repositorio o documentación del propio desarrollador.',
  sv: 'Redaktionell katalog över AI-verktyg som endast länkar till officiella nedladdnings- och användningskanaler. FuenteAI lagrar inga installationsfiler, APK-filer, körbara filer eller spegelsajter: varje post pekar på utvecklarens egen webbplats, butik, kodförråd eller dokumentation.',
  it: 'Catalogo editoriale di strumenti IA che rimanda esclusivamente ai canali ufficiali di download e utilizzo. FuenteAI non ospita installer, APK, eseguibili o mirror: ogni scheda punta al sito, allo store, al repository o alla documentazione dello sviluppatore.'
};

const LANG_NAME: Record<Lang, string> = { es: 'Español', sv: 'Svenska', it: 'Italiano' };

/**
 * Etiquetas del espejo Markdown, traducidas.
 *
 * El cuerpo de una ficha sueca ya viene en sueco; si los rotulos siguieran en
 * espanol, el agente que lea `/md/sv/...` recibiria un documento mezclado y se
 * lo pasaria asi al usuario. Se traducen por el mismo motivo por el que se
 * traduce la interfaz.
 */
const PRICING_LABEL: Record<Lang, Record<string, string>> = {
  es: { free: 'gratis', freemium: 'freemium', paid: 'de pago', enterprise: 'empresarial', unknown: 'sin confirmar' },
  sv: { free: 'gratis', freemium: 'freemium', paid: 'betald', enterprise: 'foretag', unknown: 'ej bekraftat' },
  it: { free: 'gratuito', freemium: 'freemium', paid: 'a pagamento', enterprise: 'aziendale', unknown: 'non confermato' }
};

const L: Record<Lang, Record<string, string>> = {
  es: {
    canonical: 'Fuente canónica',
    officialSite: 'Sitio oficial',
    categories: 'Categorías',
    pricing: 'Modelo de precio',
    requiresAccount: 'Requiere cuenta',
    yes: 'sí',
    no: 'no',
    unconfirmed: 'sin confirmar',
    status: 'Estado',
    active: 'activa',
    discontinued: 'descontinuada',
    lastReviewed: 'Última revisión editorial',
    description: 'Descripción',
    channels: 'Canales oficiales de descarga',
    noHosting: 'FuenteAI no aloja archivos. Cada enlace apunta al canal del propio desarrollador.',
    bestFor: 'Para qué sirve',
    limitations: 'Limitaciones',
    safety: 'Avisos de seguridad',
    community: 'Señales de la comunidad',
    source: 'Fuente',
    faq: 'Preguntas frecuentes',
    alternatives: 'Alternativas en el catálogo',
    catalogCategories: 'Categorías',
    tools: 'Herramientas',
    home: 'Portada',
    published: 'Herramientas publicadas',
    machineCatalog: 'Catálogo legible por máquina',
    inCategory: 'Herramientas en esta categoría'
  },
  sv: {
    canonical: 'Kanonisk källa',
    officialSite: 'Officiell webbplats',
    categories: 'Kategorier',
    pricing: 'Prismodell',
    requiresAccount: 'Kräver konto',
    yes: 'ja',
    no: 'nej',
    unconfirmed: 'ej bekräftat',
    status: 'Status',
    active: 'aktiv',
    discontinued: 'nedlagd',
    lastReviewed: 'Senaste redaktionella granskning',
    description: 'Beskrivning',
    channels: 'Officiella nedladdningskanaler',
    noHosting: 'FuenteAI lagrar inga filer. Varje länk pekar på utvecklarens egen kanal.',
    bestFor: 'Vad den används till',
    limitations: 'Begränsningar',
    safety: 'Säkerhetsanmärkningar',
    community: 'Signaler från communityn',
    source: 'Källa',
    faq: 'Vanliga frågor',
    alternatives: 'Alternativ i katalogen',
    catalogCategories: 'Kategorier',
    tools: 'Verktyg',
    home: 'Startsida',
    published: 'Publicerade verktyg',
    machineCatalog: 'Maskinläsbar katalog',
    inCategory: 'Verktyg i denna kategori'
  },
  it: {
    canonical: 'Fonte canonica',
    officialSite: 'Sito ufficiale',
    categories: 'Categorie',
    pricing: 'Modello di prezzo',
    requiresAccount: 'Richiede un account',
    yes: 'sì',
    no: 'no',
    unconfirmed: 'non confermato',
    status: 'Stato',
    active: 'attivo',
    discontinued: 'dismesso',
    lastReviewed: 'Ultima revisione editoriale',
    description: 'Descrizione',
    channels: 'Canali ufficiali di download',
    noHosting: 'FuenteAI non ospita file. Ogni link punta al canale dello sviluppatore.',
    bestFor: 'A cosa serve',
    limitations: 'Limiti',
    safety: 'Avvisi di sicurezza',
    community: 'Segnali dalla community',
    source: 'Fonte',
    faq: 'Domande frequenti',
    alternatives: 'Alternative nel catalogo',
    catalogCategories: 'Categorie',
    tools: 'Strumenti',
    home: 'Home',
    published: 'Strumenti pubblicati',
    machineCatalog: 'Catalogo leggibile da macchina',
    inCategory: 'Strumenti in questa categoria'
  }
};

/** URL absoluta a partir de una ruta interna de `links.ts`. */
export function abs(path: string): string {
  return path === '/' ? SITE_ORIGIN : `${SITE_ORIGIN}${path}`;
}

/**
 * Ruta del espejo Markdown de una página.
 * `/es/chatgpt` -> `/md/es/chatgpt.md`, `/` -> `/md/index.md`.
 *
 * El Worker usa exactamente esta función para resolver `Accept: text/markdown`,
 * así que el mapa ruta->markdown vive en un solo sitio.
 */
export function markdownPathFor(route: string): string {
  const clean = route.replace(/\/+$/, '');
  return clean === '' ? '/md/index.md' : `/md${clean}.md`;
}

/**
 * ¿Esta ruta tiene espejo Markdown generado?
 *
 * Solo lo tienen las páginas que salen del catálogo: portadas, fichas y
 * categorías. Las páginas legales y el 404 se escriben en `.astro` y no se
 * derivan de contenido estructurado, así que no se espejan. Sirve para no
 * anunciar en el `<head>` un `.md` que devolvería 404.
 */
export function hasMarkdownMirror(pathname: string, toolSlugs: string[]): boolean {
  const clean = pathname.replace(/\/+$/, '');
  if (clean === '' ) return true;

  const segments = clean.split('/').filter(Boolean);
  if (segments.length === 1) return (LANGS as string[]).includes(segments[0]);
  if (!(LANGS as string[]).includes(segments[0])) return false;

  if (segments.length === 2) return toolSlugs.includes(segments[1]);
  if (segments.length === 3 && segments[1] === CATEGORY_SEGMENT) {
    return CATEGORIES.some((category) => category.slug === segments[2]);
  }
  return false;
}

/** Entrada del catálogo tal y como la ve un agente. Plana y sin HTML. */
export interface AgentCatalogEntry {
  slug: string;
  name: string;
  lang: Lang;
  url: string;
  markdownUrl: string;
  summary: string;
  categories: string[];
  tags: string[];
  pricingModel: ToolMerged['pricingModel'];
  requiresAccount: ToolMerged['requiresAccount'];
  status: ToolMerged['status'];
  trustLevel: ToolMerged['trustLevel'];
  lastReviewed: string;
  officialWebsite: string;
  /** Canales oficiales por plataforma. Nunca mirrors: ver AGENTS.md. */
  officialChannels: Array<{ platform: string; url: string; type: string; isOfficial: boolean }>;
  bestFor: string[];
  limitations: string[];
  /**
   * Avisos de seguridad y preguntas frecuentes de la ficha.
   *
   * Van en el catálogo porque son justo lo que un cliente necesita para NO
   * mandar al usuario a un canal equivocado: `safetyNotes` recoge las trampas
   * conocidas de cada herramienta (APKs de terceros, instaladores
   * "modificados") y la FAQ responde lo que se pregunta antes de descargar.
   * Sin ellas el consumidor del API tiene los enlaces pero no las advertencias
   * que la página sí muestra.
   */
  safetyNotes: string[];
  faq: Array<{ question: string; answer: string }>;
  alternatives: string[];
}

export function toCatalogEntry(tool: ToolMerged, lang: Lang): AgentCatalogEntry {
  const route = toolUrl(lang, tool.slug);
  return {
    slug: tool.slug,
    name: tool.name,
    lang,
    url: abs(route),
    markdownUrl: abs(markdownPathFor(route)),
    summary: tool.shortDescription,
    categories: tool.categories,
    tags: tool.tags,
    pricingModel: tool.pricingModel,
    requiresAccount: tool.requiresAccount,
    status: tool.status,
    trustLevel: tool.trustLevel,
    lastReviewed: tool.lastReviewed,
    officialWebsite: tool.officialWebsite,
    officialChannels: Object.entries(tool.platforms)
      .filter(([, details]) => Boolean(details))
      .map(([platform, details]) => ({
        platform,
        url: details!.url,
        type: details!.type,
        isOfficial: details!.isOfficial
      })),
    bestFor: tool.bestFor,
    limitations: tool.limitations,
    safetyNotes: tool.safetyNotes,
    faq: tool.faq,
    alternatives: tool.alternatives
  };
}

/** Catálogo completo de los tres idiomas, ya aplanado. */
export async function buildAgentCatalog(): Promise<AgentCatalogEntry[]> {
  const entries: AgentCatalogEntry[] = [];
  for (const lang of LANGS) {
    const tools = await getTranslatedTools(lang);
    for (const tool of tools) entries.push(toCatalogEntry(tool, lang));
  }
  return entries;
}

// --- Markdown ---------------------------------------------------------------

const bullets = (items: string[]) => items.map((item) => `- ${item}`).join('\n');

/**
 * Ficha de herramienta en Markdown.
 *
 * Incluye el aviso de "solo canales oficiales" dentro del propio documento y
 * no solo en la plantilla HTML: un agente que se lleve este .md suelto tiene
 * que seguir viendo de dónde sale cada enlace.
 */
export function toolToMarkdown(tool: ToolMerged, lang: Lang): string {
  const parts: string[] = [];
  const route = toolUrl(lang, tool.slug);
  const l = L[lang];

  parts.push(`# ${tool.name}`);
  parts.push('');
  parts.push(`> ${tool.shortDescription}`);
  parts.push('');
  parts.push(`- ${l.canonical}: ${abs(route)}`);
  parts.push(`- ${l.officialSite}: ${tool.officialWebsite}`);
  parts.push(`- ${l.categories}: ${tool.categories.join(', ')}`);
  parts.push(`- ${l.pricing}: ${PRICING_LABEL[lang][tool.pricingModel] ?? tool.pricingModel}`);
  parts.push(
    `- ${l.requiresAccount}: ${
      tool.requiresAccount === 'unknown' ? l.unconfirmed : tool.requiresAccount ? l.yes : l.no
    }`
  );
  parts.push(`- ${l.status}: ${tool.status === 'discontinued' ? l.discontinued : l.active}`);
  parts.push(`- ${l.lastReviewed}: ${tool.lastReviewed}`);
  parts.push('');

  parts.push(`## ${l.description}`);
  parts.push('');
  parts.push(tool.longDescription);
  parts.push('');

  const channels = Object.entries(tool.platforms).filter(([, d]) => Boolean(d));
  if (channels.length > 0) {
    parts.push(`## ${l.channels}`);
    parts.push('');
    parts.push(l.noHosting);
    parts.push('');
    for (const [platform, details] of channels) {
      parts.push(`- **${platform}** (${details!.type}): ${details!.url}`);
    }
    parts.push('');
  }

  if (tool.bestFor.length > 0) {
    parts.push(`## ${l.bestFor}`);
    parts.push('');
    parts.push(bullets(tool.bestFor));
    parts.push('');
  }

  if (tool.limitations.length > 0) {
    parts.push(`## ${l.limitations}`);
    parts.push('');
    parts.push(bullets(tool.limitations));
    parts.push('');
  }

  if (tool.safetyNotes.length > 0) {
    parts.push(`## ${l.safety}`);
    parts.push('');
    parts.push(bullets(tool.safetyNotes));
    parts.push('');
  }

  for (const section of tool.editorialSections) {
    parts.push(`## ${section.heading}`);
    parts.push('');
    parts.push(section.body);
    parts.push('');
  }

  if (tool.communityInsights.length > 0) {
    parts.push(`## ${l.community}`);
    parts.push('');
    for (const insight of tool.communityInsights) {
      const label = insight.sourceLabel ?? insight.source;
      const date = insight.date ? ` (${insight.date})` : '';
      parts.push(`- ${insight.text}`);
      parts.push(`  ${l.source}: [${label}](${insight.source})${date}`);
    }
    parts.push('');
  }

  if (tool.faq.length > 0) {
    parts.push(`## ${l.faq}`);
    parts.push('');
    for (const item of tool.faq) {
      parts.push(`### ${item.question}`);
      parts.push('');
      parts.push(item.answer);
      parts.push('');
    }
  }

  if (tool.alternatives.length > 0) {
    parts.push(`## ${l.alternatives}`);
    parts.push('');
    parts.push(bullets(tool.alternatives.map((slug) => abs(toolUrl(lang, slug)))));
    parts.push('');
  }

  return parts.join('\n').trimEnd() + '\n';
}

/** Portada de un idioma en Markdown: qué es el sitio y qué contiene. */
export async function homeToMarkdown(lang: Lang): Promise<string> {
  const tools = await getTranslatedTools(lang);
  const parts: string[] = [];
  const l = L[lang];

  parts.push(`# ${SITE_NAME} — ${LANG_NAME[lang]}`);
  parts.push('');
  parts.push(`> ${SITE_SUMMARY[lang]}`);
  parts.push('');
  parts.push(`- ${l.home}: ${abs(homeUrl(lang))}`);
  parts.push(`- ${l.published} (${LANG_NAME[lang]}): ${tools.length}`);
  parts.push(`- ${l.machineCatalog}: ${abs('/api/catalog.json')}`);
  parts.push('');

  parts.push(`## ${l.catalogCategories}`);
  parts.push('');
  for (const category of CATEGORIES) {
    parts.push(`- [${category.label[lang]}](${abs(categoryUrl(lang, category.slug))}) — ${category.blurb[lang]}`);
  }
  parts.push('');

  parts.push(`## ${l.tools}`);
  parts.push('');
  for (const tool of tools) {
    parts.push(`- [${tool.name}](${abs(toolUrl(lang, tool.slug))}) — ${tool.shortDescription}`);
  }
  parts.push('');

  return parts.join('\n').trimEnd() + '\n';
}

/** Página de categoría en Markdown. */
export async function categoryToMarkdown(lang: Lang, slug: string): Promise<string | null> {
  const category = CATEGORIES.find((entry) => entry.slug === slug);
  if (!category) return null;

  const tools = (await getTranslatedTools(lang)).filter((tool) => tool.categories.includes(slug));
  const parts: string[] = [];
  const l = L[lang];

  parts.push(`# ${category.label[lang]}`);
  parts.push('');
  parts.push(`> ${category.description[lang]}`);
  parts.push('');
  parts.push(`- ${l.canonical}: ${abs(categoryUrl(lang, slug))}`);
  parts.push(`- ${l.inCategory}: ${tools.length}`);
  parts.push('');
  parts.push(`## ${l.tools}`);
  parts.push('');
  for (const tool of tools) {
    parts.push(`- [${tool.name}](${abs(toolUrl(lang, tool.slug))}) — ${tool.shortDescription}`);
  }
  parts.push('');

  return parts.join('\n').trimEnd() + '\n';
}

// --- llms.txt ---------------------------------------------------------------

/**
 * `/llms.txt` según llmstxt.org: H1, resumen y enlaces a lo importante.
 * Se queda en el índice; el detalle va a `/llms-full.txt`.
 */
export async function buildLlmsTxt(): Promise<string> {
  const parts: string[] = [];
  parts.push(`# ${SITE_NAME}`);
  parts.push('');
  parts.push(`> ${SITE_SUMMARY.es}`);
  parts.push('');
  parts.push(
    'El catálogo se publica en tres idiomas con URLs independientes y hreflang recíproco: español en `/`, sueco en `/sv` e italiano en `/it`. Cada ficha declara su fecha de última revisión editorial y el tipo de cada canal oficial (sitio, tienda, repositorio, documentación o gestor de paquetes).'
  );
  parts.push('');

  parts.push('## Portadas');
  parts.push('');
  for (const lang of LANGS) {
    parts.push(`- [${SITE_NAME} — ${LANG_NAME[lang]}](${abs(homeUrl(lang))}): ${SITE_SUMMARY[lang]}`);
  }
  parts.push('');

  parts.push('## Recursos para agentes');
  parts.push('');
  parts.push(`- [Catálogo completo en JSON](${abs('/api/catalog.json')}): las ${(await buildAgentCatalog()).length} fichas publicadas, con canales oficiales, categorías, precio y fecha de revisión.`);
  parts.push(`- [Especificación OpenAPI](${abs('/api/openapi.json')}): contrato de los endpoints de solo lectura.`);
  parts.push(`- [Servidor MCP](${abs('/.well-known/mcp/server-card.json')}): tarjeta del servidor MCP en \`${abs('/mcp')}\` para consultar el catálogo como herramienta.`);
  parts.push(`- [Agent Card A2A](${abs('/.well-known/agent-card.json')}): interfaz agente-a-agente en \`${abs('/a2a')}\`.`);
  parts.push(`- [Manifiesto ARD](${abs('/.well-known/ai-catalog.json')}): índice de capacidades del dominio.`);
  parts.push(`- [Autenticación](${abs('/auth.md')}): todo lo anterior es público y anónimo; no hay registro ni credenciales.`);
  parts.push('');

  parts.push('## Categorías');
  parts.push('');
  for (const category of CATEGORIES) {
    parts.push(`- [${category.label.es}](${abs(categoryUrl('es', category.slug))}): ${category.description.es}`);
  }
  parts.push('');

  parts.push('## Sobre el proyecto');
  parts.push('');
  parts.push(`- [Acerca de](${abs(pageUrl('es', 'acerca-de'))}): criterio editorial y qué se verifica en cada ficha.`);
  parts.push(`- [Aviso legal](${abs(pageUrl('es', 'aviso-legal'))}): FuenteAI no está afiliada a los desarrolladores que cataloga.`);
  parts.push(`- [Privacidad](${abs(pageUrl('es', 'privacidad'))})`);
  parts.push('');

  parts.push('## Optional');
  parts.push('');
  parts.push(`- [llms-full.txt](${abs('/llms-full.txt')}): el catálogo entero expandido en un solo documento.`);
  parts.push(`- [Sitemap](${abs('/sitemap-index.xml')})`);
  parts.push('');

  return parts.join('\n').trimEnd() + '\n';
}

/** `/llms-full.txt`: el catálogo en español expandido, ficha a ficha. */
export async function buildLlmsFullTxt(): Promise<string> {
  const parts: string[] = [];
  parts.push(`# ${SITE_NAME} — catálogo completo`);
  parts.push('');
  parts.push(`> ${SITE_SUMMARY.es}`);
  parts.push('');
  parts.push(
    'Este documento expande el catálogo en español. Las versiones sueca e italiana viven en `/sv` y `/it`; el catálogo de los tres idiomas en JSON está en `/api/catalog.json`. Cada ficha es un extracto del contenido publicado en su URL canónica, que es la fuente de verdad.'
  );
  parts.push('');

  const tools = await getTranslatedTools('es');
  for (const tool of tools) {
    parts.push('---');
    parts.push('');
    parts.push(toolToMarkdown(tool, 'es').trimEnd());
    parts.push('');
  }

  return parts.join('\n').trimEnd() + '\n';
}
