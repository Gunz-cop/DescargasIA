import fs from 'fs';
import path from 'path';

export function getSitemapDates(siteUrl) {
  const dates = {};
  const locales = ['es', 'sv', 'it'];

  // Leer fechas de herramientas desde content/tools-base
  const toolsBaseDir = './src/content/tools-base';
  const toolsDir = './src/content/tools';
  
  if (fs.existsSync(toolsBaseDir)) {
    const files = fs.readdirSync(toolsBaseDir).filter(f => f.endsWith('.json'));
    files.forEach(file => {
      try {
        const slug = file.replace('.json', '');
        const data = JSON.parse(fs.readFileSync(path.join(toolsBaseDir, file), 'utf-8'));
        const lastReviewed = data.lastReviewed;
        
        if (lastReviewed) {
          // Asignar fecha para cada localización que tenga traducción real
          locales.forEach(lang => {
            const locFile = path.join(toolsDir, lang, file);
            if (fs.existsSync(locFile)) {
              dates[`${siteUrl}/${lang}/${slug}`] = new Date(lastReviewed);
            }
          });
        }
      } catch (e) {
        console.error('Error al leer fecha de herramienta para sitemap:', file, e);
      }
    });
  }

  // Leer fechas de guías localizadas: src/content/guides/<lang>/<slug>.md
  //
  // Se recorre carpeta por carpeta y SOLO se asigna `lastmod` a la URL del
  // idioma cuyo archivo existe. Antes se copiaba la fecha de la guía española
  // a `/sv/guias/...` e `/it/guias/...`, URLs que ni siquiera se generan.
  const guidesDir = './src/content/guides';
  if (fs.existsSync(guidesDir)) {
    locales.forEach(lang => {
      const langDir = path.join(guidesDir, lang);
      if (!fs.existsSync(langDir)) return;

      fs.readdirSync(langDir)
        .filter(f => f.endsWith('.md'))
        .forEach(file => {
          try {
            const content = fs.readFileSync(path.join(langDir, file), 'utf-8');
            const match = content.match(/lastUpdated:\s*['"]?([\d-]+)['"]?/);
            const pubMatch = content.match(/datePublished:\s*['"]?([\d-]+)['"]?/);
            const slug = file.replace(/\.md$/, '');
            const dateStr = match ? match[1] : (pubMatch ? pubMatch[1] : null);
            if (dateStr) {
              dates[`${siteUrl}/${lang}/guias/${slug}`] = new Date(dateStr);
            }
          } catch (e) {
            console.error('Error al leer fecha de guía para sitemap:', lang, file, e);
          }
        });
    });
  }

  return dates;
}
