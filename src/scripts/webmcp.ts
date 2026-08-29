/** Registro WebMCP común, con configuración leída de atributos del documento. */

(() => {
  const ctx = (navigator as Navigator & {
    modelContext?: { registerTool: (tool: Record<string, unknown>) => void };
  }).modelContext;
  if (!ctx || typeof ctx.registerTool !== 'function') return;

  const body = document.body;
  const pageLang = body.dataset.webmcpLang || 'es';
  const langs = (body.dataset.webmcpLangs || 'es,sv,it').split(',').filter(Boolean);
  let catalogPromise: Promise<any> | null = null;

  const loadCatalog = () => {
    catalogPromise ||= fetch('/api/catalog.json').then((r) => r.json());
    return catalogPromise;
  };

  const fold = (value: unknown) =>
    String(value ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const textResult = (text: string) => ({ content: [{ type: 'text', text }] });
  const resolveLang = (requested: unknown) => (langs.includes(String(requested)) ? String(requested) : pageLang);

  try {
    ctx.registerTool({
      name: 'search_ai_tools',
      description:
        'Busca herramientas de IA en el catálogo de FuenteAI. Devuelve nombre, descripción, categorías, modelo de precio, plataformas con canal oficial y la URL de la ficha. FuenteAI no aloja archivos: las fichas enlazan al canal del propio desarrollador.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Qué busca el usuario: nombre, uso o tecnología. Ejemplo: "transcribir audio en local".'
          },
          category: {
            type: 'string',
            description:
              'Slug de categoría: asistentes-ia, programacion, modelos-locales, generacion-imagenes, video-ia, musica-ia, traduccion-redaccion-ia, productividad-presentaciones-ia.'
          },
          platform: {
            type: 'string',
            enum: ['web', 'windows', 'mac', 'linux', 'android', 'ios'],
            description: 'Solo herramientas con canal oficial para esta plataforma.'
          },
          lang: {
            type: 'string',
            enum: ['es', 'sv', 'it'],
            description: 'Idioma de las fichas. Por defecto, el idioma de la página que se está viendo.'
          },
          limit: { type: 'integer', minimum: 1, maximum: 25, description: 'Máximo de resultados (por defecto 8).' }
        }
      },
      async execute({ query, category, platform, lang, limit }: any) {
        const catalog = await loadCatalog();
        const wanted = resolveLang(lang);
        const words = fold(query).split(/\s+/).filter(Boolean);
        const max = Math.min(Math.max(Number(limit) || 8, 1), 25);
        const results = catalog.tools
          .filter((tool: any) => tool.lang === wanted)
          .filter((tool: any) => (category ? tool.categories.includes(category) : true))
          .filter((tool: any) => (platform ? tool.officialChannels.some((channel: any) => channel.platform === platform) : true))
          .filter((tool: any) => {
            if (words.length === 0) return true;
            const haystack = fold([tool.name, tool.summary, tool.tags.join(' '), tool.categories.join(' ')].join(' '));
            return words.every((word: string) => haystack.includes(word));
          })
          .slice(0, max);

        if (results.length === 0) {
          return textResult(`Ningún resultado en el catálogo (idioma "${wanted}") con esos filtros. El catálogo completo está en ${catalog.site}/api/catalog.json`);
        }

        return textResult(
          results
            .map((tool: any) =>
              [
                `${tool.name} — ${tool.summary}`,
                `  Ficha: ${tool.url}`,
                `  Sitio oficial: ${tool.officialWebsite}`,
                `  Categorías: ${tool.categories.join(', ')} | Precio: ${tool.pricingModel}`,
                `  Canales oficiales: ${tool.officialChannels.map((channel: any) => channel.platform).join(', ') || 'ninguno registrado'}`
              ].join('\n')
            )
            .join('\n\n')
        );
      }
    });

    ctx.registerTool({
      name: 'open_ai_tool_page',
      description:
        'Abre en esta pestaña la ficha de una herramienta del catálogo de FuenteAI, donde están sus canales oficiales de descarga por plataforma.',
      inputSchema: {
        type: 'object',
        properties: {
          slug: {
            type: 'string',
            description: 'Identificador de la herramienta, tal como lo devuelve search_ai_tools. Ejemplo: "chatgpt".'
          },
          lang: {
            type: 'string',
            enum: ['es', 'sv', 'it'],
            description: 'Idioma de la ficha. Por defecto, el idioma de la página que se está viendo.'
          }
        },
        required: ['slug']
      },
      async execute({ slug, lang }: any) {
        const catalog = await loadCatalog();
        const wanted = resolveLang(lang);
        const entry = catalog.tools.find((tool: any) => tool.slug === slug && tool.lang === wanted);
        if (!entry) {
          const elsewhere = catalog.tools.filter((tool: any) => tool.slug === slug).map((tool: any) => tool.lang);
          return textResult(
            elsewhere.length > 0
              ? `"${slug}" no está publicada en "${wanted}". Sí existe en: ${elsewhere.join(', ')}.`
              : `No hay ninguna ficha con el identificador "${slug}". Usa search_ai_tools para localizarla.`
          );
        }

        const href = new URL(new URL(entry.url).pathname, location.origin).href;
        location.assign(href);
        return textResult(`Abriendo ${href}`);
      }
    });
  } catch (error) {
    console.debug('WebMCP no disponible:', error);
  }
})();
