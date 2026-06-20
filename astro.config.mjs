import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { getSitemapDates } from './scripts/get-sitemap-dates.mjs';

const SITE_URL = 'https://fuenteai.com';
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
      redirectToDefaultLocale: false
    }
  },
  integrations: [
    sitemap({
      filter: (page) => {
        const isEsHome = page.replace(/\/$/, '') === `${SITE_URL}/es`;
        const isIt = /\/it(\/|$)/.test(page);
        const isIr = page.includes('/ir/');
        const isR = /\/r(\/|$)/.test(page);
        return !isEsHome && !isIt && !isIr && !isR;
      },
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
