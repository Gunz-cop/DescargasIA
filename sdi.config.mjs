// Integrado el 2026-08-12. Ver .github/workflows/deploy.yml para el flujo
// build -> wrangler deploy -> sdi run, y docs/guides/ASTRO_CLOUDFLARE.md en
// el repo de SDI para el contrato completo.
export default {
  siteId: "fuenteai",
  siteUrl: "https://fuenteai.com",
  source: {
    distDir: "./dist",
    sitemapPath: "./dist/sitemap-0.xml",
    fallbackToHtmlScan: false,
  },
  normalization: {
    trailingSlash: "never",
  },
  statePath: "./.sdi/state.json",
  reportPath: "./.sdi/last-run.json",
  indexNow: {
    keyEnv: "INDEXNOW_KEY",
    keyLocation: "https://fuenteai.com/de78f66b30a9da0caaa0a30db3c860d1.txt",
  },
};
