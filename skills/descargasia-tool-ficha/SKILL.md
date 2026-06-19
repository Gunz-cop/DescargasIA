---
name: descargasia-tool-ficha
description: Create, research, write, validate, and maintain DescargasIA AI tool fichas in Astro content JSON. Use when the user asks to add new AI tools, find missing tools, create or improve product/tool pages, write SEO/editorial ficha content, verify official download links, generate FAQ structured data, classify platforms/categories, avoid fake installers/mirrors/APKs, or prepare DescargasIA fichas for SEO, AdSense, E-E-A-T, and mobile-first UX.
---

# DescargasIA Tool Ficha

Use this skill to create or improve tool fichas for DescargasIA.

## First Steps

1. Work inside the DescargasIA Astro repo.
2. Read `AGENTS.md`, `docs/ux-tool-pages.md`, and `docs/ux-home-cards.md` when present.
3. Read the local examples in `src/content/tools/`, especially `chatgpt.json` and any mature ficha in the same category.
4. Read the relevant reference files in this skill:
   - `references/workflow.md` for the end-to-end process.
   - `references/schema-contract.md` for JSON fields.
   - `references/editorial-writing.md` for content quality.
   - `references/source-policy.md` for official-link rules.
   - `references/validation.md` before build/commit.

## Non-Negotiables

- Do not invent tools, platforms, claims, app availability, prices, official status, or security guarantees.
- Do not link to mirrors, APK aggregators, unofficial installers, cracked apps, reuploads, or “premium unlocked” pages.
- Prefer primary sources: official site, official docs, official GitHub org/repo, Microsoft Store, Google Play, App Store, VS Code/JB marketplaces when relevant.
- If users search for a nonexistent desktop app, say so clearly in the ficha and route them to the actual official channel.
- Use monograms/brand-inspired colors only. Do not add logos/screenshots unless usage rights or official asset policy is documented.
- Keep CTA and platform decision near the top; place longer SEO/editorial content below.
- Always run `npm run build` and fix collection/schema errors before finalizing.

## Output Standard

For each tool, create or update `src/content/tools/<slug>.json` with:

- clear `shortDescription` and `longDescription`;
- real platforms only;
- `bestFor`, `limitations`, `editorialSummary`, `editorialSections`, `faq`, and `safetyNotes`;
- official sources and internal alternatives that exist;
- category and visual initials;
- `lastReviewed` using the current date.

If categories are missing, add category JSON only when it improves navigation and matches the existing taxonomy.

## Handoff

In the final response, summarize:

- fichas added/updated;
- important “no installer” clarifications;
- build result;
- broken or unverified links, if any;
- remaining risks such as external shortener/API failures.
