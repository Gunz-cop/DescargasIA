---
name: descargasia-tool-ficha
description: Research, select, create, validate, and maintain localized DescargasIA AI tool fichas and intent-led guides. Use for country-specific multilingual SEO research, market opportunity matrices, official download-link verification, native editorial writing, or ficha planning/authoring without translating or copying another locale's tool selection.
---

# DescargasIA Tool Ficha

Create trustworthy, market-specific content that routes people to official AI-tool channels. Treat each language-country pair as an independent editorial market.

## Start With Scope

1. Read `AGENTS.md`, `docs/ux-tool-pages.md`, `docs/ux-home-cards.md`, and local mature examples.
2. Read `references/workflow.md` and `references/localized-research.md` before researching or selecting candidates.
3. Define and state a market brief: language, target country or countries, language variant, predominant platforms, editorial register, and research date. Ask for the missing market definition before making a selection when it cannot be inferred safely from the request.
4. Read `references/schema-contract.md`, `references/editorial-writing.md`, `references/source-policy.md`, and `references/validation.md` before editing fichas.

## Core Rules

- Research demand, search wording, SERPs, competition, and candidate tools separately for every market. Never translate a Spanish ficha, query list, FAQ, or tool selection into another locale by default.
- Make native queries, grouped by download/access, installation, use, alternatives, privacy, offline use, and platform intent. Do not use literal translations as research evidence.
- Separate confirmed volume, trend data, search suggestions, and qualitative evidence. Do not present one type as another.
- Prioritize demonstrated demand plus weak, confusing, stale, unsafe, or incomplete results. Do not choose a query only because it is novel or low competition, and do not treat low competition without demand as an opportunity.
- Audit first-page results for intent, official sources, target-language fit, freshness, destination confusion, clone/APK risk, and observable editorial competition.
- Classify the deliverable before writing: a tool ficha serves an identifiable tool; a guide serves an intent that spans tools or needs decision support. Record why important candidates were rejected.
- Use only official product domains, official documentation, official stores, official upstream repositories, or official marketplaces. State plainly when no official installer exists.
- Do not invent tools, platforms, availability, pricing, privacy/legal/security claims, volume, trends, or endorsements. Never link to mirrors, APK portals, modified installers, or reuploads.

## Deliverables

For research or planning, return the market brief, inventory findings, SERP audit, opportunity matrix, selection/rejection rationale, evidence type, confidence, and sources.

For a ficha session, keep verified product data in `src/content/tools-base/<slug>.json` and create native editorial content only in `src/content/tools/<lang>/<slug>.json`. Keep the existing JSON contract unchanged unless the user explicitly authorizes a necessary contract change.

Before finalizing a ficha session, perform the checks in `references/validation.md`, including `npm run build`. Report no-installer clarifications and unresolved regional availability or evidence gaps.

## Handoff

Summarize the target market, selected and rejected candidates, evidence quality, official-link findings, files changed, build result, and remaining risks.
