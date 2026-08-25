/**
 * Lectura y búsqueda del catálogo para los endpoints de agentes.
 *
 * Los datos salen siempre de `/api/catalog.json`, el archivo que genera el
 * build de Astro desde las mismas colecciones que las fichas HTML. No hay una
 * segunda copia del catálogo dentro del Worker que pueda desincronizarse.
 *
 * Ver `docs/agent-readiness.md`.
 */
import type { AgentEnv } from './types';

export const ORIGIN = 'https://fuenteai.com';

export interface CatalogChannel {
  platform: string;
  url: string;
  type: string;
  isOfficial: boolean;
}

export interface CatalogTool {
  slug: string;
  name: string;
  lang: string;
  url: string;
  markdownUrl: string;
  summary: string;
  categories: string[];
  tags: string[];
  pricingModel: string;
  requiresAccount: boolean | 'unknown';
  status: string;
  trustLevel: string;
  lastReviewed: string;
  officialWebsite: string;
  officialChannels: CatalogChannel[];
  bestFor: string[];
  limitations: string[];
  safetyNotes: string[];
  faq: Array<{ question: string; answer: string }>;
  alternatives: string[];
}

export interface Catalog {
  site: string;
  languages: string[];
  categories: Array<{ slug: string; label: Record<string, string>; description: Record<string, string> }>;
  count: number;
  tools: CatalogTool[];
}

/** Cache por isolate: el catálogo es estático entre despliegues. */
let catalogCache: Catalog | null = null;

export async function loadCatalog(env: AgentEnv): Promise<Catalog> {
  if (catalogCache) return catalogCache;
  const response = await env.ASSETS.fetch(`${ORIGIN}/api/catalog.json`);
  if (!response.ok) throw new Error(`No se pudo leer /api/catalog.json (${response.status})`);
  catalogCache = (await response.json()) as Catalog;
  return catalogCache;
}

/** Normaliza para buscar sin acentos ni mayúsculas. */
export const fold = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export interface SearchArgs {
  query?: string;
  category?: string;
  platform?: string;
  pricing?: string;
  lang?: string;
  limit?: number;
}

/**
 * Palabras que no discriminan nada en una consulta sobre este catálogo. Un
 * agente A2A escribe frases completas ("qué herramientas hay para generar
 * música"), y exigir que aparezca "herramientas" en la ficha descarta justo
 * las buenas. Se quitan en los tres idiomas del sitio.
 */
const STOPWORDS = new Set([
  'que', 'qué', 'cual', 'cuales', 'como', 'para', 'por', 'con', 'sin', 'una', 'uno', 'unas', 'unos',
  'del', 'las', 'los', 'sus', 'este', 'esta', 'estos', 'estas', 'hay', 'busco', 'buscar', 'quiero',
  'necesito', 'mejor', 'mejores', 'herramienta', 'herramientas', 'aplicacion', 'aplicaciones', 'app',
  'apps', 'programa', 'programas', 'software', 'alguna', 'algun', 'donde', 'puedo', 'recomienda',
  'recomiendame', 'dame', 'muestrame', 'and', 'the', 'for', 'with', 'tool', 'tools', 'app',
  'vilka', 'verktyg', 'finns', 'behover', 'basta', 'som', 'och', 'for', 'med', 'utan',
  'quali', 'strumenti', 'sono', 'cerco', 'voglio', 'migliore', 'migliori', 'per', 'con', 'senza'
]);

/** Divide una consulta en términos útiles: sin acentos, sin ruido, sin monosílabos. */
function terms(query: string): string[] {
  return fold(query)
    .split(/[^a-z0-9+#.-]+/)
    .filter((word) => word.length >= 3 && !STOPWORDS.has(word));
}

/** Texto sobre el que se busca. El nombre pesa aparte para poder priorizarlo. */
const haystackOf = (tool: CatalogTool) =>
  fold([tool.summary, tool.tags.join(' '), tool.categories.join(' '), tool.bestFor.join(' ')].join(' '));

function applyFilters(catalog: Catalog, args: SearchArgs): { tools: CatalogTool[]; lang: string } {
  const lang = args.lang && catalog.languages.includes(args.lang) ? args.lang : 'es';
  const tools = catalog.tools
    .filter((tool) => tool.lang === lang)
    .filter((tool) => (args.category ? tool.categories.includes(args.category) : true))
    .filter((tool) =>
      args.platform ? tool.officialChannels.some((channel) => channel.platform === args.platform) : true
    )
    .filter((tool) => (args.pricing ? tool.pricingModel === args.pricing : true));
  return { tools, lang };
}

/**
 * Búsqueda estricta: todos los términos deben aparecer.
 *
 * Es la semántica de `search_tools` en MCP, donde quien consulta es un agente
 * que ya eligió las palabras clave y espera que cada filtro reste.
 */
export function searchCatalog(catalog: Catalog, args: SearchArgs): CatalogTool[] {
  const { tools } = applyFilters(catalog, args);
  const words = args.query ? terms(args.query) : [];
  const limit = Math.min(Math.max(args.limit ?? 10, 1), 50);

  return tools
    .filter((tool) => {
      if (words.length === 0) return true;
      const haystack = fold(tool.name) + ' ' + haystackOf(tool);
      return words.every((word) => haystack.includes(word));
    })
    .slice(0, limit);
}

/**
 * Búsqueda tolerante y ordenada por relevancia: basta con que coincida un
 * término, y ganan las fichas que coinciden en más y las que coinciden por
 * nombre. Es lo que necesita el agente A2A, que recibe frases enteras.
 */
export function rankCatalog(catalog: Catalog, args: SearchArgs): CatalogTool[] {
  const { tools } = applyFilters(catalog, args);
  const words = terms(args.query ?? '');
  const limit = Math.min(Math.max(args.limit ?? 5, 1), 50);
  if (words.length === 0) return tools.slice(0, limit);

  return tools
    .map((tool) => {
      const name = fold(tool.name);
      const haystack = haystackOf(tool);
      let score = 0;
      for (const word of words) {
        if (name.includes(word)) score += 3;
        else if (haystack.includes(word)) score += 1;
      }
      return { tool, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.tool);
}

/** Resumen textual de una herramienta, para respuestas de agente. */
export function describeTool(tool: CatalogTool): string {
  const channels = tool.officialChannels.map((c) => `${c.platform}: ${c.url}`).join(' | ');
  return [
    `${tool.name} — ${tool.summary}`,
    `  Ficha: ${tool.url}`,
    `  Sitio oficial: ${tool.officialWebsite}`,
    `  Precio: ${tool.pricingModel} | Estado: ${tool.status} | Revisada: ${tool.lastReviewed}`,
    channels ? `  Canales oficiales — ${channels}` : '  Sin canales de descarga registrados'
  ].join('\n');
}
