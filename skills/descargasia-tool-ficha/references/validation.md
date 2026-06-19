# Validation

Run these checks before finalizing.

## Build

```bash
npm run build
```

Build must pass. If LinkZip or another external shortener reports `fetch failed` but Astro still builds, report it as operational risk rather than blocking unless generated routes are wrong.

## Slug/Alternative Integrity

Use this Node check from the repo root:

```bash
node -e 'const fs=require("fs");const dir="src/content/tools";const files=fs.readdirSync(dir).filter(f=>f.endsWith(".json"));const tools=files.map(f=>JSON.parse(fs.readFileSync(dir+"/"+f,"utf8")));const slugs=new Set(tools.map(t=>t.slug));let bad=[];for(const t of tools){for(const a of t.alternatives||[]){if(!slugs.has(a)) bad.push(t.slug+"->"+a)}}console.log(JSON.stringify({count:tools.length,bad},null,2));if(bad.length) process.exit(1);'
```

## Duplicate Check

Look for same product under multiple slugs:

- same `name`;
- same `officialWebsite`;
- same known brand with slightly different slug.

Prefer one canonical slug. If a duplicate already exists, update the richer existing ficha instead of creating a second one.

## Manual Review

Check at least one new ficha page and the home:

- title and CTA are clear;
- platform cards show real channels;
- long editorial content appears below the quick decision area;
- FAQ is visible;
- official sources render;
- mobile card has recognizable name, domain, and CTA.
