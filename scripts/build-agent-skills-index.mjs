/**
 * Genera `public/.well-known/agent-skills/index.json` (Agent Skills Discovery
 * v0.2.0) a partir de los SKILL.md que hay en ese mismo directorio.
 *
 * El índice lleva un `digest` sha256 de cada artefacto: un cliente lo usa para
 * detectar que la skill cambió sin volver a descargarla. Escrito a mano se
 * queda desactualizado en la primera edición de un SKILL.md, así que se genera
 * en cada build (`npm run agents:skills`, encadenado antes de `astro build`).
 *
 * La `description` sale del frontmatter del propio SKILL.md: una sola fuente.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const SKILLS_DIR = path.join('public', '.well-known', 'agent-skills');
const OUTPUT = path.join(SKILLS_DIR, 'index.json');
const BASE = 'https://fuenteai.com/.well-known/agent-skills';

/** Lee `name` y `description` del frontmatter YAML mínimo de un SKILL.md. */
function readFrontmatter(source, file) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error(`${file}: falta el frontmatter --- ... ---`);

  const fields = {};
  let current = null;
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (kv) {
      current = kv[1];
      fields[current] = kv[2].trim();
    } else if (current && line.trim()) {
      // Continuación de una descripción escrita en varias líneas.
      fields[current] += ' ' + line.trim();
    }
  }

  for (const key of ['name', 'description']) {
    if (!fields[key]) throw new Error(`${file}: el frontmatter no define "${key}"`);
  }
  return fields;
}

if (!fs.existsSync(SKILLS_DIR)) {
  console.error(`No existe ${SKILLS_DIR}.`);
  process.exit(1);
}

const skills = fs
  .readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()
  .map((dir) => {
    const file = path.join(SKILLS_DIR, dir, 'SKILL.md');
    if (!fs.existsSync(file)) throw new Error(`${dir}/ no contiene un SKILL.md`);

    const source = fs.readFileSync(file, 'utf8');
    const { name, description } = readFrontmatter(source, file);

    if (name !== dir) {
      throw new Error(`${file}: el "name" del frontmatter ("${name}") no coincide con la carpeta ("${dir}")`);
    }

    return {
      name,
      type: 'skill-md',
      description,
      url: `${BASE}/${dir}/SKILL.md`,
      digest: 'sha256:' + crypto.createHash('sha256').update(source).digest('hex')
    };
  });

if (skills.length === 0) {
  console.error(`No hay ninguna skill en ${SKILLS_DIR}.`);
  process.exit(1);
}

const index = {
  $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
  skills
};

fs.writeFileSync(OUTPUT, JSON.stringify(index, null, 2) + '\n');
console.log(`Agent Skills: ${skills.length} skill(s) indexadas en ${OUTPUT}`);
for (const skill of skills) console.log(`  - ${skill.name} (${skill.digest.slice(0, 19)}...)`);
