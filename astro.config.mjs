import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { getSitemapDates } from './scripts/get-sitemap-dates.mjs';

const SITE_URL = 'https://fuenteia.com';
const sitemapDates = getSitemapDates(SITE_URL);

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'directory'
  },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'sv', 'it'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true
    }
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
