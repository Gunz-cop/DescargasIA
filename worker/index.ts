/**
 * Worker delante de los assets estáticos.
 *
 * El sitio sigue siendo un build estático de Astro: este Worker no renderiza
 * páginas. Solo hace las tres cosas que un archivo estático no puede hacer:
 *
 *   1. `Accept: text/markdown` -> devolver el espejo Markdown de la página
 *      (Markdown for Agents / negociación de contenido).
 *   2. `POST /mcp` -> servidor MCP (Streamable HTTP) con herramientas de
 *      consulta del catálogo.
 *   3. `POST /a2a` -> agente A2A que responde consultas del catálogo.
 *
 * Todo lo demás cae a `env.ASSETS.fetch(request)` sin tocar nada, y cualquier
 * excepción cae ahí también: un fallo en el código de agentes no puede tumbar
 * la web para personas.
 *
 * Los datos salen siempre de `/api/catalog.json`, el mismo archivo generado en
 * build desde las colecciones de contenido. No hay una segunda copia del
 * catálogo dentro del Worker que pueda quedar desincronizada.
 *
 * Ver `docs/agent-readiness.md`.
 */

interface Env {
  ASSETS: { fetch: (request: Request | string) => Promise<Response> };
}

const ORIGIN = 'https://fuenteai.com';
const SERVER_NAME = 'fuenteai-catalog';
const SERVER_VERSION = '1.0.0';

/** Versiones del protocolo MCP que sabemos hablar. Se responde la del cliente si está. */
const SUPPORTED_MCP_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];
const DEFAULT_MCP_VERSION = '2025-06-18';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id',
  'Access-Control-Max-Age': '86400'
};

// --- Catálogo ---------------------------------------------------------------

interface CatalogChannel {
  platform: string;
  url: string;
  type: string;
  isOfficial: boolean;
}

interface CatalogTool {
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
  alternatives: string[];
}

interface Catalog {
  site: string;
  languages: string[];
  categories: Array<{ slug: string; label: Record<string, string>; description: Record<string, string> }>;
  count: number;
  tools: CatalogTool[];
}

/** Cache por isolate: el catálogo es estático entre despliegues. */
let catalogCache: Catalog | null = null;

async function loadCatalog(env: Env): Promise<Catalog> {
  if (catalogCache) return catalogCache;
  const response = await env.ASSETS.fetch(`${ORIGIN}/api/catalog.json`);
  if (!response.ok) throw new Error(`No se pudo leer /api/catalog.json (${response.status})`);
  catalogCache = (await response.json()) as Catalog;
  return catalogCache;
}

/** Normaliza para buscar sin acentos ni mayúsculas. */
const fold = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

interface SearchArgs {
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
function searchCatalog(catalog: Catalog, args: SearchArgs): CatalogTool[] {
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
function rankCatalog(catalog: Catalog, args: SearchArgs): CatalogTool[] {
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
function describeTool(tool: CatalogTool): string {
  const channels = tool.officialChannels.map((c) => `${c.platform}: ${c.url}`).join(' | ');
  return [
    `${tool.name} — ${tool.summary}`,
    `  Ficha: ${tool.url}`,
    `  Sitio oficial: ${tool.officialWebsite}`,
    `  Precio: ${tool.pricingModel} | Estado: ${tool.status} | Revisada: ${tool.lastReviewed}`,
    channels ? `  Canales oficiales — ${channels}` : '  Sin canales de descarga registrados'
  ].join('\n');
}

// --- MCP --------------------------------------------------------------------

const MCP_TOOLS = [
  {
    name: 'search_tools',
    title: 'Buscar herramientas de IA',
    description:
      'Busca herramientas de IA en el catálogo de FuenteAI por texto libre, categoría, plataforma o modelo de precio. Devuelve la ficha, el sitio oficial y los canales oficiales de descarga de cada resultado. FuenteAI no aloja archivos: todos los enlaces son del propio desarrollador.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Texto libre: nombre, uso o tecnología. Ejemplo: "transcribir audio en local".' },
        category: {
          type: 'string',
          description: 'Slug de categoría. Usar list_categories para ver los disponibles.'
        },
        platform: {
          type: 'string',
          enum: ['web', 'windows', 'mac', 'linux', 'android', 'ios'],
          description: 'Solo herramientas con canal oficial para esta plataforma.'
        },
        pricing: {
          type: 'string',
          enum: ['free', 'freemium', 'paid', 'enterprise', 'unknown'],
          description: 'Modelo de precio.'
        },
        lang: { type: 'string', enum: ['es', 'sv', 'it'], description: 'Idioma de las fichas. Por defecto "es".' },
        limit: { type: 'integer', minimum: 1, maximum: 50, description: 'Número máximo de resultados (por defecto 10).' }
      },
      additionalProperties: false
    }
  },
  {
    name: 'get_tool',
    title: 'Leer una ficha completa',
    description:
      'Devuelve la ficha editorial completa de una herramienta en Markdown: descripción, canales oficiales por plataforma, para qué sirve, limitaciones, avisos de seguridad, señales de la comunidad con su fuente, y preguntas frecuentes.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Identificador de la herramienta. Ejemplo: "chatgpt".' },
        lang: { type: 'string', enum: ['es', 'sv', 'it'], description: 'Idioma de la ficha. Por defecto "es".' }
      },
      required: ['slug'],
      additionalProperties: false
    }
  },
  {
    name: 'list_categories',
    title: 'Listar categorías',
    description: 'Lista las categorías del catálogo con su slug, su nombre y cuántas herramientas contiene.',
    inputSchema: {
      type: 'object',
      properties: {
        lang: { type: 'string', enum: ['es', 'sv', 'it'], description: 'Idioma de las etiquetas. Por defecto "es".' }
      },
      additionalProperties: false
    }
  }
] as const;

const MCP_RESOURCES = [
  {
    uri: `${ORIGIN}/llms.txt`,
    name: 'llms.txt',
    title: 'Resumen del sitio para modelos de lenguaje',
    description: 'Qué es FuenteAI, cómo se organiza el catálogo y dónde está cada recurso legible por máquina.',
    mimeType: 'text/plain'
  },
  {
    uri: `${ORIGIN}/api/catalog.json`,
    name: 'catalog.json',
    title: 'Catálogo completo en JSON',
    description: 'Todas las fichas publicadas en los tres idiomas, con sus canales oficiales.',
    mimeType: 'application/json'
  },
  {
    uri: `${ORIGIN}/llms-full.txt`,
    name: 'llms-full.txt',
    title: 'Catálogo en español expandido',
    description: 'Todas las fichas en español en un solo documento de texto.',
    mimeType: 'text/plain'
  }
] as const;

const textResult = (text: string, isError = false) => ({
  content: [{ type: 'text', text }],
  isError
});

async function callMcpTool(env: Env, name: string, args: Record<string, unknown>) {
  const catalog = await loadCatalog(env);

  if (name === 'search_tools') {
    const results = searchCatalog(catalog, args as SearchArgs);
    if (results.length === 0) {
      return textResult(
        'Ningún resultado con esos filtros. El catálogo tiene ' +
          catalog.count +
          ' fichas; probar con menos filtros o con list_categories para ver las categorías disponibles.'
      );
    }
    return textResult(
      `${results.length} resultado(s) en el catálogo de FuenteAI:\n\n` + results.map(describeTool).join('\n\n')
    );
  }

  if (name === 'get_tool') {
    const slug = String((args as { slug?: unknown }).slug ?? '');
    const lang = String((args as { lang?: unknown }).lang ?? 'es');
    const tool = catalog.tools.find((entry) => entry.slug === slug && entry.lang === lang);
    if (!tool) {
      const inOtherLangs = catalog.tools.filter((entry) => entry.slug === slug).map((entry) => entry.lang);
      return textResult(
        inOtherLangs.length > 0
          ? `"${slug}" no está publicada en "${lang}". Sí existe en: ${inOtherLangs.join(', ')}.`
          : `No hay ninguna ficha con el identificador "${slug}". Usar search_tools para localizarla.`,
        true
      );
    }
    // La ficha en Markdown ya está generada en build; se sirve tal cual para
    // que el agente lea exactamente lo mismo que la página publicada.
    const markdown = await env.ASSETS.fetch(tool.markdownUrl);
    if (markdown.ok) return textResult(await markdown.text());
    return textResult(describeTool(tool));
  }

  if (name === 'list_categories') {
    const lang = String((args as { lang?: unknown }).lang ?? 'es');
    const lines = catalog.categories.map((category) => {
      const count = catalog.tools.filter(
        (tool) => tool.lang === lang && tool.categories.includes(category.slug)
      ).length;
      return `- ${category.slug}: ${category.label[lang] ?? category.label.es} (${count} herramientas) — ${
        category.description[lang] ?? category.description.es
      }`;
    });
    return textResult(`Categorías del catálogo (idioma "${lang}"):\n\n${lines.join('\n')}`);
  }

  return textResult(`Herramienta desconocida: ${name}`, true);
}

const rpcResult = (id: unknown, result: unknown) => ({ jsonrpc: '2.0', id, result });
const rpcError = (id: unknown, code: number, message: string) => ({
  jsonrpc: '2.0',
  id,
  error: { code, message }
});

async function handleMcpMessage(env: Env, message: Record<string, unknown>): Promise<unknown | null> {
  const { id, method, params } = message as { id?: unknown; method?: string; params?: Record<string, unknown> };

  // Las notificaciones no llevan id y no se responden (JSON-RPC 2.0 §4.1).
  if (id === undefined || id === null) return null;

  switch (method) {
    case 'initialize': {
      const asked = String(params?.protocolVersion ?? '');
      return rpcResult(id, {
        protocolVersion: SUPPORTED_MCP_VERSIONS.includes(asked) ? asked : DEFAULT_MCP_VERSION,
        capabilities: { tools: {}, resources: {} },
        serverInfo: { name: SERVER_NAME, title: 'FuenteAI — catálogo de herramientas de IA', version: SERVER_VERSION },
        instructions:
          'Catálogo editorial de herramientas de IA con enlaces exclusivamente a canales oficiales. Usar search_tools para localizar herramientas y get_tool para leer una ficha completa. FuenteAI no aloja instaladores ni mirrors: los enlaces devueltos son del desarrollador de cada herramienta.'
      });
    }
    case 'ping':
      return rpcResult(id, {});
    case 'tools/list':
      return rpcResult(id, { tools: MCP_TOOLS });
    case 'tools/call': {
      const name = String(params?.name ?? '');
      const args = (params?.arguments ?? {}) as Record<string, unknown>;
      try {
        return rpcResult(id, await callMcpTool(env, name, args));
      } catch (error) {
        return rpcResult(id, textResult(`Error ejecutando ${name}: ${(error as Error).message}`, true));
      }
    }
    case 'resources/list':
      return rpcResult(id, { resources: MCP_RESOURCES });
    case 'resources/read': {
      const uri = String(params?.uri ?? '');
      const known = MCP_RESOURCES.find((resource) => resource.uri === uri);
      if (!known) return rpcError(id, -32002, `Recurso no encontrado: ${uri}`);
      const response = await env.ASSETS.fetch(uri);
      if (!response.ok) return rpcError(id, -32002, `No se pudo leer ${uri}`);
      return rpcResult(id, {
        contents: [{ uri, mimeType: known.mimeType, text: await response.text() }]
      });
    }
    case 'prompts/list':
      return rpcResult(id, { prompts: [] });
    default:
      return rpcError(id, -32601, `Método no soportado: ${method}`);
  }
}

async function handleMcp(request: Request, env: Env): Promise<Response> {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS });

  // El servidor no abre streams iniciados por él, así que no hay nada que
  // entregar en un GET (MCP Streamable HTTP lo contempla explícitamente).
  if (request.method !== 'POST') {
    return new Response(JSON.stringify(rpcError(null, -32000, 'Este servidor MCP solo acepta POST.')), {
      status: 405,
      headers: { 'Content-Type': 'application/json', Allow: 'POST, OPTIONS', ...CORS_HEADERS }
    });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify(rpcError(null, -32700, 'JSON inválido')), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  }

  const batch = Array.isArray(payload) ? payload : [payload];
  const responses: unknown[] = [];
  for (const message of batch) {
    const response = await handleMcpMessage(env, (message ?? {}) as Record<string, unknown>);
    if (response !== null) responses.push(response);
  }

  // Solo notificaciones: nada que devolver.
  if (responses.length === 0) return new Response(null, { status: 202, headers: CORS_HEADERS });

  const body = Array.isArray(payload) ? responses : responses[0];
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
  });
}

// --- A2A --------------------------------------------------------------------

/** Texto plano de un `Message` A2A, concatenando sus partes de texto. */
function a2aMessageText(message: Record<string, unknown> | undefined): string {
  const parts = (message?.parts ?? []) as Array<Record<string, unknown>>;
  return parts
    .filter((part) => part.kind === 'text' || part.type === 'text')
    .map((part) => String(part.text ?? ''))
    .join(' ')
    .trim();
}

const a2aTextMessage = (text: string, contextId?: string) => ({
  kind: 'message',
  role: 'agent',
  messageId: crypto.randomUUID(),
  ...(contextId ? { contextId } : {}),
  parts: [{ kind: 'text', text }]
});

async function handleA2a(request: Request, env: Env): Promise<Response> {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (request.method !== 'POST') {
    return new Response(JSON.stringify(rpcError(null, -32000, 'Este endpoint A2A solo acepta POST.')), {
      status: 405,
      headers: { 'Content-Type': 'application/json', Allow: 'POST, OPTIONS', ...CORS_HEADERS }
    });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return new Response(JSON.stringify(rpcError(null, -32700, 'JSON inválido')), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  }

  const id = payload.id ?? null;
  const method = String(payload.method ?? '');
  const params = (payload.params ?? {}) as Record<string, unknown>;

  if (method !== 'message/send') {
    return new Response(
      JSON.stringify(
        rpcError(
          id,
          -32601,
          `Este agente solo implementa "message/send" (recibido: "${method}"). Responde de forma síncrona, sin tareas de larga duración.`
        )
      ),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }

  const incoming = params.message as Record<string, unknown> | undefined;
  const query = a2aMessageText(incoming);
  const contextId = incoming?.contextId ? String(incoming.contextId) : undefined;

  if (!query) {
    return new Response(
      JSON.stringify(
        rpcResult(
          id,
          a2aTextMessage(
            'Envía en el mensaje qué herramienta de IA buscas y respondo con las fichas del catálogo y sus canales oficiales de descarga.',
            contextId
          )
        )
      ),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }

  const catalog = await loadCatalog(env);
  const results = rankCatalog(catalog, { query, limit: 5 });
  const text =
    results.length === 0
      ? `No encontré nada para "${query}" en el catálogo de FuenteAI (${catalog.count} fichas). El catálogo completo está en ${ORIGIN}/api/catalog.json.`
      : `Esto es lo que tiene FuenteAI para "${query}". FuenteAI no aloja archivos: cada enlace es del desarrollador.\n\n` +
        results.map(describeTool).join('\n\n');

  return new Response(JSON.stringify(rpcResult(id, a2aTextMessage(text, contextId))), {
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
  });
}

// --- Negociación de contenido ----------------------------------------------

/**
 * `/es/chatgpt` -> `/md/es/chatgpt.md`, `/` -> `/md/index.md`.
 * Gemela de `markdownPathFor()` en `src/utils/agent-content.ts`, que es la que
 * decide el nombre del archivo generado en build.
 */
function markdownPathFor(pathname: string): string {
  const clean = pathname.replace(/\/+$/, '');
  return clean === '' ? '/md/index.md' : `/md${clean}.md`;
}

function prefersMarkdown(request: Request): boolean {
  const accept = request.headers.get('accept');
  return Boolean(accept && accept.toLowerCase().includes('text/markdown'));
}

async function serveMarkdown(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);
  const target = new URL(markdownPathFor(url.pathname), url.origin);
  const response = await env.ASSETS.fetch(target.toString());
  if (!response.ok) return null; // La página no tiene espejo: se sirve el HTML.

  const headers = new Headers(response.headers);
  headers.set('Content-Type', 'text/markdown; charset=utf-8');
  // El asset de /md/** va marcado noindex para no competir con el canonical,
  // pero ESTA URL si es indexable: la cabecera no debe viajar con ella.
  headers.delete('X-Robots-Tag');
  // La representación canónica sigue siendo el HTML de esta misma URL.
  headers.set('Link', `<${url.origin}${url.pathname}>; rel="canonical"`);
  headers.set('Vary', 'Accept');
  return new Response(response.body, { status: 200, headers });
}

// --- Entrada ----------------------------------------------------------------

async function route(request: Request, env: Env): Promise<Response> {
  const { pathname } = new URL(request.url);

  if (pathname === '/mcp') return handleMcp(request, env);
  if (pathname === '/a2a') return handleA2a(request, env);

  if ((request.method === 'GET' || request.method === 'HEAD') && prefersMarkdown(request)) {
    const markdown = await serveMarkdown(request, env);
    if (markdown) return markdown;
  }

  const response = await env.ASSETS.fetch(request);

  // La misma URL puede devolver HTML o Markdown segun `Accept`: sin este Vary
  // una cache intermedia podria servirle Markdown a un navegador.
  if (request.method === 'GET' || request.method === 'HEAD') {
    const headers = new Headers(response.headers);
    headers.append('Vary', 'Accept');
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
  return response;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return await route(request, env);
    } catch (error) {
      // Nada de lo de arriba puede impedir que la web se sirva.
      console.error('worker error', error);
      return env.ASSETS.fetch(request);
    }
  }
};
