/**
 * Un `AgentEnv` de mentira para los tests: solo el binding `ASSETS`.
 *
 * `tryAgentRoutes` y todo lo que hay debajo leen el sitio a través de
 * `env.ASSETS.fetch()`, así que con esto se puede probar el Worker entero sin
 * levantar `wrangler dev` ni construir `dist/`.
 */

/** Catálogo mínimo pero con la forma real, incluidos safetyNotes y faq. */
export const CATALOGO = {
  site: 'https://fuenteai.com',
  languages: ['es', 'sv', 'it'],
  categories: [
    { slug: 'asistentes-ia', label: { es: 'Asistentes IA', sv: 'AI-assistenter', it: 'Assistenti IA' }, description: { es: 'x', sv: 'x', it: 'x' } }
  ],
  count: 2,
  tools: [
    {
      slug: 'chatgpt', name: 'ChatGPT', lang: 'es',
      url: 'https://fuenteai.com/es/chatgpt',
      markdownUrl: 'https://fuenteai.com/md/es/chatgpt.md',
      summary: 'Asistente conversacional de OpenAI.',
      categories: ['asistentes-ia'], tags: ['chat'],
      pricingModel: 'freemium', requiresAccount: true, status: 'active',
      trustLevel: 'official', lastReviewed: '2026-08-12',
      officialWebsite: 'https://chatgpt.com',
      officialChannels: [{ platform: 'web', url: 'https://chatgpt.com', type: 'web-app', isOfficial: true }],
      bestFor: ['redactar'], limitations: [], safetyNotes: ['No instales APKs de terceros.'],
      faq: [{ question: '¿Es seguro?', answer: 'Sí, desde el canal oficial.' }],
      alternatives: []
    },
    {
      slug: 'chatgpt', name: 'ChatGPT', lang: 'sv',
      url: 'https://fuenteai.com/sv/chatgpt',
      markdownUrl: 'https://fuenteai.com/md/sv/chatgpt.md',
      summary: 'OpenAI:s AI-assistent.',
      categories: ['asistentes-ia'], tags: ['chat'],
      pricingModel: 'freemium', requiresAccount: true, status: 'active',
      trustLevel: 'official', lastReviewed: '2026-08-12',
      officialWebsite: 'https://chatgpt.com',
      officialChannels: [{ platform: 'web', url: 'https://chatgpt.com', type: 'web-app', isOfficial: true }],
      bestFor: [], limitations: [], safetyNotes: [], faq: [],
      alternatives: []
    }
  ]
};

/**
 * @param {Record<string, {status?: number, body?: string, headers?: Record<string,string>}>} rutas
 *   mapa de pathname -> respuesta. Lo que no esté listado devuelve 404.
 */
export function fakeEnv(rutas = {}) {
  return {
    ASSETS: {
      async fetch(input) {
        const url = new URL(typeof input === 'string' ? input : input.url);
        const hit = rutas[url.pathname];
        if (!hit) return new Response('Not Found', { status: 404 });
        return new Response(hit.body ?? '', {
          status: hit.status ?? 200,
          headers: hit.headers ?? {}
        });
      }
    }
  };
}

/** Env con el catálogo servible en /api/catalog.json. */
export function envConCatalogo(extra = {}) {
  return fakeEnv({
    '/api/catalog.json': { body: JSON.stringify(CATALOGO), headers: { 'Content-Type': 'application/json' } },
    ...extra
  });
}

/** Env donde el catálogo NO se puede leer. */
export function envSinCatalogo() {
  return fakeEnv({});
}

/** POST JSON-RPC contra una ruta de la capa de agentes. */
export function rpc(pathname, cuerpo, cabeceras = {}) {
  return new Request(`https://fuenteai.com${pathname}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...cabeceras },
    body: JSON.stringify(cuerpo)
  });
}
