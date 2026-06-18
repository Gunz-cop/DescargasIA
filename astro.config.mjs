import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { getSitemapDates } from './scripts/get-sitemap-dates.mjs';

const SITE_URL = 'https://descargasia.com';
const sitemapDates = getSitemapDates(SITE_URL);

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'directory'
  },
  integrations: [
    sitemap({
      serialize(item) {
        const cleanUrl = item.url.replace(/\/$/, ''); // Remover slash final para la coincidencia de clave
        if (sitemapDates[cleanUrl]) {
          item.lastmod = sitemapDates[cleanUrl].toISOString();
        }
        return item;
      }
    })
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
