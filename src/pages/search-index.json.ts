import { getTranslatedTools } from '../utils/tools';

export async function GET() {
  const tools = await getTranslatedTools('es');
  const data = tools.map(t => ({
    name: t.name,
    slug: t.slug,
    shortDescription: t.shortDescription,
    categories: t.categories,
    tags: t.tags,
    pricingModel: t.pricingModel,
    platforms: Object.keys(t.platforms)
  }));

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
}
