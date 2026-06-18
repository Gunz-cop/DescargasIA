import { getCollection } from 'astro:content';

export async function GET() {
  const tools = await getCollection('tools');
  const data = tools.map(t => ({
    name: t.data.name,
    slug: t.data.slug,
    shortDescription: t.data.shortDescription,
    categories: t.data.categories,
    tags: t.data.tags,
    pricingModel: t.data.pricingModel,
    platforms: Object.keys(t.data.platforms).filter(p => t.data.platforms[p as keyof typeof t.data.platforms])
  }));

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
}
