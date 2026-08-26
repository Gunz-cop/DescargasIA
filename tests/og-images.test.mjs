import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const SITE_ORIGIN = 'https://fuenteai.com';

function htmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? htmlFiles(file) : entry.name.endsWith('.html') ? [file] : [];
  });
}

test('cada og:image local del build apunta a un fichero existente en dist', () => {
  assert.ok(fs.existsSync(DIST), 'dist/ no existe; ejecuta el test después de astro build');

  const pages = htmlFiles(DIST);
  assert.ok(pages.length > 0, 'el build no generó páginas HTML');

  let pagesWithImage = 0;
  for (const page of pages) {
    const html = fs.readFileSync(page, 'utf8');
    const match = html.match(/<meta property="og:image" content="([^"]+)"/i);
    if (!match) continue;
    pagesWithImage += 1;

    const imageUrl = new URL(match[1], SITE_ORIGIN);
    if (imageUrl.origin !== SITE_ORIGIN) continue;

    const relative = decodeURIComponent(imageUrl.pathname).replace(/^\//, '').replaceAll('/', path.sep);
    const imagePath = path.join(DIST, relative);
    assert.ok(fs.existsSync(imagePath), `${path.relative(DIST, page)} apunta a ${imageUrl.pathname}, pero no existe en dist/`);
  }

  assert.ok(pagesWithImage > 0, 'el build no generó ninguna og:image para verificar');
});
