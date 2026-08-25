/**
 * Servidor MCP (Streamable HTTP) sobre el catálogo de FuenteAI.
 *
 * Sin estado y sin sesión: cada POST se resuelve solo. No abre streams
 * iniciados por el servidor, así que `GET /mcp` responde 405, que la spec
 * contempla explícitamente.
 *
 * Ver `docs/agent-readiness.md`.
 */
import { loadCatalog, searchCatalog, describeTool, ORIGIN, type CatalogTool, type SearchArgs } from './catalog.ts';
import {
  checkOrigin,
  corsHeaders,
  forbiddenOrigin,
  JsonBodyError,
  jsonResponse,
  readJsonBody,
  rpcError,
  rpcResult
} from './http.ts';
import type { AgentEnv } from './types.ts';

const SERVER_NAME = 'fuenteai-catalog';
const SERVER_VERSION = '1.0.0';

/** Versiones del protocolo MCP que sabemos hablar. Se responde la del cliente si está. */
const SUPPORTED_MCP_VERSIONS = ['2025-06-18', '2025-03-26'];
const DEFAULT_MCP_VERSION = '2025-06-18';

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

async function callMcpTool(env: AgentEnv, name: string, args: Record<string, unknown>) {
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
    const markdown = await env.ASSETS.fetch(new Request(tool.markdownUrl));
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


async function handleMcpMessage(env: AgentEnv, message: Record<string, unknown>): Promise<unknown | null> {
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
      const response = await env.ASSETS.fetch(new Request(uri));
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

export async function handleMcp(request: Request, env: AgentEnv): Promise<Response> {
  // Requisito de la spec de Streamable HTTP: validar Origin en toda conexión
  // para prevenir DNS rebinding. Ver el porqué de la política en ./http.ts.
  const origin = checkOrigin(request);
  if (!origin.allowed) return forbiddenOrigin(origin);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  // El servidor no abre streams iniciados por él, así que no hay nada que
  // entregar en un GET (MCP Streamable HTTP lo contempla explícitamente).
  if (request.method !== 'POST') {
    return new Response(JSON.stringify(rpcError(null, -32000, 'Este servidor MCP solo acepta POST.')), {
      status: 405,
      headers: { 'Content-Type': 'application/json', Allow: 'POST, OPTIONS', ...corsHeaders(origin) }
    });
  }

  const accepted = (request.headers.get('accept') ?? '')
    .toLowerCase()
    .split(',')
    .map((value) => value.split(';', 1)[0].trim());
  if (!accepted.includes('application/json') || !accepted.includes('text/event-stream')) {
    return jsonResponse(
      rpcError(null, -32000, 'Accept debe incluir application/json y text/event-stream'),
      origin,
      406
    );
  }

  let payload: unknown;
  try {
    payload = await readJsonBody(request);
  } catch (error) {
    if (error instanceof JsonBodyError) {
      return jsonResponse(rpcError(null, error.rpcCode, error.message), origin, error.status);
    }
    throw error;
  }

  // Streamable HTTP admite exactamente un mensaje JSON-RPC por POST, no lotes.
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return jsonResponse(rpcError(null, -32600, 'Mensaje JSON-RPC inválido'), origin, 400);
  }

  const message = payload as Record<string, unknown>;
  if (message.jsonrpc !== '2.0' || typeof message.method !== 'string') {
    return jsonResponse(rpcError(message.id ?? null, -32600, 'Mensaje JSON-RPC inválido'), origin, 400);
  }

  const protocolVersion = request.headers.get('mcp-protocol-version');
  if (
    message.method !== 'initialize' &&
    protocolVersion !== null &&
    !SUPPORTED_MCP_VERSIONS.includes(protocolVersion)
  ) {
    return jsonResponse(rpcError(message.id ?? null, -32000, 'Mcp-Protocol-Version no soportada'), origin, 400);
  }

  const response = await handleMcpMessage(env, message);
  if (response === null) {
    return new Response(null, { status: 202, headers: corsHeaders(origin) });
  }

  return jsonResponse(response, origin);
}
