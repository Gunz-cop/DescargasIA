import { SITE_ORIGIN, SITE_SUMMARY } from '../../utils/agent-content';

/**
 * `/api/openapi.json` — contrato de los endpoints de solo lectura del sitio.
 *
 * Es el `service-desc` que anuncian la cabecera `Link` y `/.well-known/api-catalog`
 * (RFC 9727). Solo describe endpoints que existen de verdad y que devuelven
 * datos ya publicados: no hay escritura, no hay autenticación y no hay estado.
 */
export async function GET() {
  const spec = {
    openapi: '3.1.0',
    info: {
      title: 'FuenteAI — API de lectura del catálogo',
      version: '1.0.0',
      description: `${SITE_SUMMARY.es}\n\nTodos los endpoints son estáticos, públicos y de solo lectura. No requieren autenticación: ver ${SITE_ORIGIN}/auth.md.`,
      license: { name: 'Contenido editorial de FuenteAI', url: `${SITE_ORIGIN}/es/aviso-legal` }
    },
    servers: [{ url: SITE_ORIGIN }],
    paths: {
      '/api/catalog.json': {
        get: {
          operationId: 'getCatalog',
          summary: 'Catálogo completo de herramientas en los tres idiomas',
          description:
            'Devuelve todas las fichas publicadas con sus canales oficiales, categorías, modelo de precio, estado y fecha de última revisión editorial.',
          responses: {
            '200': {
              description: 'Catálogo completo',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Catalog' }
                }
              }
            }
          }
        }
      },
      '/search-index.json': {
        get: {
          operationId: 'getSearchIndex',
          summary: 'Índice reducido en español que alimenta el buscador del sitio',
          description:
            'Subconjunto del catálogo en español pensado para filtrado en cliente. Para datos completos usar /api/catalog.json.',
          responses: {
            '200': {
              description: 'Índice de búsqueda',
              content: { 'application/json': { schema: { type: 'array', items: { type: 'object' } } } }
            }
          }
        }
      },
      '/llms.txt': {
        get: {
          operationId: 'getLlmsTxt',
          summary: 'Resumen del sitio para modelos de lenguaje (llmstxt.org)',
          responses: {
            '200': { description: 'Documento llms.txt', content: { 'text/plain': { schema: { type: 'string' } } } }
          }
        }
      },
      '/llms-full.txt': {
        get: {
          operationId: 'getLlmsFullTxt',
          summary: 'Catálogo en español expandido en un solo documento de texto',
          responses: {
            '200': { description: 'Documento llms-full.txt', content: { 'text/plain': { schema: { type: 'string' } } } }
          }
        }
      },
      '/md/{path}.md': {
        get: {
          operationId: 'getPageMarkdown',
          summary: 'Espejo en Markdown de una página del sitio',
          description:
            'Misma información que el HTML de la página equivalente. También accesible pidiendo la URL normal con la cabecera `Accept: text/markdown`.',
          parameters: [
            {
              name: 'path',
              in: 'path',
              required: true,
              description: 'Ruta de la página sin barra inicial. Ejemplo: `es/chatgpt`.',
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': { description: 'Página en Markdown', content: { 'text/markdown': { schema: { type: 'string' } } } },
            '404': { description: 'La página no tiene espejo Markdown' }
          }
        }
      }
    },
    components: {
      schemas: {
        Catalog: {
          type: 'object',
          required: ['site', 'languages', 'count', 'tools'],
          properties: {
            site: { type: 'string', format: 'uri' },
            generatedAt: { type: 'string', format: 'date-time' },
            languages: { type: 'array', items: { type: 'string', enum: ['es', 'sv', 'it'] } },
            categories: { type: 'array', items: { type: 'object' } },
            count: { type: 'integer' },
            tools: { type: 'array', items: { $ref: '#/components/schemas/Tool' } }
          }
        },
        Tool: {
          type: 'object',
          required: ['slug', 'name', 'lang', 'url', 'summary'],
          properties: {
            slug: { type: 'string' },
            name: { type: 'string' },
            lang: { type: 'string', enum: ['es', 'sv', 'it'] },
            url: { type: 'string', format: 'uri', description: 'URL canónica de la ficha.' },
            markdownUrl: { type: 'string', format: 'uri' },
            summary: { type: 'string' },
            categories: { type: 'array', items: { type: 'string' } },
            tags: { type: 'array', items: { type: 'string' } },
            pricingModel: { type: 'string', enum: ['free', 'freemium', 'paid', 'enterprise', 'unknown'] },
            requiresAccount: { oneOf: [{ type: 'boolean' }, { type: 'string', enum: ['unknown'] }] },
            status: { type: 'string', enum: ['active', 'discontinued'] },
            trustLevel: { type: 'string', enum: ['official', 'verified', 'pending-review'] },
            lastReviewed: { type: 'string', format: 'date' },
            officialWebsite: { type: 'string', format: 'uri' },
            officialChannels: {
              type: 'array',
              description: 'Canales del propio desarrollador. FuenteAI no aloja archivos ni enlaza mirrors.',
              items: {
                type: 'object',
                properties: {
                  platform: { type: 'string', enum: ['web', 'windows', 'mac', 'linux', 'android', 'ios'] },
                  url: { type: 'string', format: 'uri' },
                  type: {
                    type: 'string',
                    enum: [
                      'official-site',
                      'app-store',
                      'web-app',
                      'documentation',
                      'official-installer',
                      'github-repo',
                      'package-manager'
                    ]
                  },
                  isOfficial: { type: 'boolean' }
                }
              }
            },
            bestFor: { type: 'array', items: { type: 'string' } },
            limitations: { type: 'array', items: { type: 'string' } },
            safetyNotes: {
              type: 'array',
              description:
                'Trampas conocidas al descargar esta herramienta. Muéstralas junto al enlace, no en lugar de él.',
              items: { type: 'string' }
            },
            faq: {
              type: 'array',
              description: 'Preguntas frecuentes de la ficha, en el idioma de la entrada.',
              items: {
                type: 'object',
                required: ['question', 'answer'],
                properties: { question: { type: 'string' }, answer: { type: 'string' } }
              }
            },
            alternatives: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    }
  };

  return new Response(JSON.stringify(spec), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}
