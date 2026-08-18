/**
 * Reparto de enlaces internos entre fichas.
 *
 * Problema que resuelve: el bloque de alternativas rellenaba los huecos con
 * `allTools.filter(...).slice(0, 6)`, siempre en el mismo orden. En una
 * categoría de 17 fichas eso significa que las 6 primeras reciben todos los
 * enlaces y las 11 restantes no reciben ninguno. El grafo medido antes del
 * cambio daba 2-4 enlaces entrantes por ficha y 24 herramientas nunca citadas
 * como alternativa por nadie.
 *
 * Solución: el relleno rota de forma DETERMINISTA según el slug de la ficha
 * origen. Sigue siendo estático (mismo HTML en cada build, sin aleatoriedad
 * que confunda a Google), pero cada ficha empieza a recorrer la lista en un
 * punto distinto, así que los enlaces se reparten por toda la categoría.
 */

/** Hash estable de una cadena. Mismo slug -> mismo número, en todos los builds. */
function stableHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Rota una lista a partir de un desplazamiento derivado de `seed`.
 * Con listas de 0 o 1 elemento devuelve la lista tal cual.
 */
export function rotateBySeed<T>(items: T[], seed: string): T[] {
  if (items.length < 2) return items;
  const offset = stableHash(seed) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

interface RelatedInput<T extends { slug: string; categories: string[] }> {
  tool: T;
  allTools: T[];
  /** Slugs declarados a mano en `tools-base/<slug>.json` -> `alternatives`. */
  declared: string[];
  limit: number;
}

/**
 * Devuelve las fichas del bloque "alternativas": primero las declaradas por el
 * equipo editorial (son las relaciones con más valor semántico), luego el
 * relleno rotado de la misma categoría.
 */
export function getAlternatives<T extends { slug: string; categories: string[] }>({
  tool,
  allTools,
  declared,
  limit
}: RelatedInput<T>): T[] {
  const bySlug = new Map(allTools.map((entry) => [entry.slug, entry]));
  const picked: T[] = [];
  const seen = new Set<string>([tool.slug]);

  for (const slug of declared) {
    const entry = bySlug.get(slug);
    if (entry && !seen.has(slug)) {
      picked.push(entry);
      seen.add(slug);
    }
  }

  const primary = tool.categories[0] ?? '';
  const sameCategory = allTools
    .filter((candidate) => !seen.has(candidate.slug) && candidate.categories.includes(primary))
    .sort((a, b) => a.slug.localeCompare(b.slug));

  for (const candidate of rotateBySeed(sameCategory, tool.slug)) {
    if (picked.length >= limit) break;
    picked.push(candidate);
    seen.add(candidate.slug);
  }

  return picked.slice(0, limit);
}

/**
 * Fichas para el bloque "sigue explorando" del pie. Su papel es doble: dar
 * salida al visitante que ya decidió, y sacar del pozo a las fichas de la cola
 * larga que ninguna alternativa cita.
 *
 * Prioridad: primero herramientas que comparten ALGUNA categoría con la ficha
 * y que el bloque de alternativas no mostró —el enlace sigue siendo temático,
 * que es lo que Google sabe interpretar—; solo si no hay suficientes se
 * completa con el resto del catálogo.
 */
export function getKeepExploring<T extends { slug: string; categories: string[] }>(
  tool: T,
  allTools: T[],
  exclude: T[],
  limit: number
): T[] {
  const seen = new Set<string>([tool.slug, ...exclude.map((entry) => entry.slug)]);

  const pool = allTools.filter((candidate) => !seen.has(candidate.slug));
  const related = new Set(
    pool.filter((candidate) => tool.categories.some((cat) => candidate.categories.includes(cat)))
  );
  const preferred = [...related];
  const rest = pool.filter((candidate) => !related.has(candidate));

  const ordered = [
    ...rotateBySeed(preferred.sort((a, b) => a.slug.localeCompare(b.slug)), tool.slug),
    ...rotateBySeed(rest.sort((a, b) => a.slug.localeCompare(b.slug)), tool.slug + '#')
  ];

  return ordered.slice(0, limit);
}
