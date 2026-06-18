import fs from 'fs';
import path from 'path';

export function getSitemapDates(siteUrl) {
  const dates = {};

  // Leer fechas de herramientas
  const toolsDir = './src/content/tools';
  if (fs.existsSync(toolsDir)) {
    const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.json'));
    files.forEach(file => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(toolsDir, file), 'utf-8'));
        if (data.slug && data.lastReviewed) {
          dates[`${siteUrl}/${data.slug}`] = new Date(data.lastReviewed);
        }
      } catch (e) {
        console.error('Error al leer fecha de herramienta para sitemap:', file, e);
      }
    });
  }

  // Leer fechas de guías
  const guidesDir = './src/content/guides';
  if (fs.existsSync(guidesDir)) {
    const files = fs.readdirSync(guidesDir).filter(f => f.endsWith('.md'));
    files.forEach(file => {
      try {
        const content = fs.readFileSync(path.join(guidesDir, file), 'utf-8');
        const match = content.match(/lastUpdated:\s*['"]?([\d-]+)['"]?/);
        const pubMatch = content.match(/datePublished:\s*['"]?([\d-]+)['"]?/);
        const slug = file.replace(/\.md$/, '');
        const dateStr = match ? match[1] : (pubMatch ? pubMatch[1] : null);
        if (dateStr) {
          dates[`${siteUrl}/guias/${slug}`] = new Date(dateStr);
        }
      } catch (e) {
        console.error('Error al leer fecha de guía para sitemap:', file, e);
      }
    });
  }

  return dates;
}
