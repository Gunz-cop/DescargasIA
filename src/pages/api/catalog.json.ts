import { buildAgentCatalog, SITE_ORIGIN } from '../../utils/agent-content';
import { CATEGORIES } from '../../utils/brand';
import { LANGS } from '../../utils/links';

/**
 * `/api/catalog.json` — el catálogo entero, en los tres idiomas, en un solo
 * documento estático.
 *
 * Es la fuente que consume el servidor MCP y el agente A2A del Worker, y lo
 * que describe `/api/openapi.json`. Se genera en build desde las mismas
 * colecciones que las fichas HTML: no hay una segunda base de datos que
 * pueda quedar desincronizada.
 */
export async function GET() {
  const entries = await buildAgentCatalog();

  const body = {
    site: SITE_ORIGIN,
    generatedAt: new Date().toISOString(),
    languages: LANGS,
    categories: CATEGORIES.map((category) => ({
      slug: category.slug,
      label: category.label,
      description: category.description
    })),
    count: entries.length,
    tools: entries
  };

  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}
