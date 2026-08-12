# Workflow

## 1. Define the Market

Write this brief before research:

| Field | Record |
| --- | --- |
| Language | ISO/local language name |
| Countries | One or more explicit target countries |
| Variant | For example, Spanish (Spain), Italian (Italy), Swedish (Sweden) |
| Predominant platforms | Web, Windows, macOS, Android, iOS, Linux, extensions, package managers |
| Editorial register | Neutral, direct, formal, technical, etc. |
| Research date | ISO `YYYY-MM-DD` |

Do not silently reuse the Spanish market, its vocabulary, or its selected tools for another locale. A language route is not proof of country demand.

## 2. Build the Inventory

- List `src/content/tools-base/*.json` and every `src/content/tools/<lang>/*.json`.
- Detect duplicate products by normalized name and official domain; compare alternatives against existing base slugs.
- Record which localized fichas already exist, but treat them only as inventory evidence, never as a backlog for translation.
- Identify gaps in each target locale: missing tool, weak native coverage, outdated official route, or unmet intent that needs a guide instead of a ficha.

## 3. Research Local Demand

Follow `localized-research.md`. For each target market, create native query candidates in these intent clusters:

- download/access;
- installation and platform;
- use or task;
- alternatives/comparison;
- privacy, account, and data handling;
- offline/local use;
- app, web, extension, store, GitHub, documentation, or package-manager route.

Use available search and volume tools. Label evidence precisely as confirmed volume, trend, suggestion, or qualitative SERP/user evidence. Keep sources and date with every material finding.

## 4. Audit Candidate Results

For each viable query, inspect the first results and record:

- dominant intent and language/country fit;
- official result presence and prominence;
- stale, incomplete, or misleading coverage;
- confusion between a web app, desktop app, extension, store listing, GitHub, or installer;
- clone, APK, mirror, or fake-download risk;
- observable editorial competition and whether a new page can add verified decision value.

## 5. Create the Opportunity Matrix

Use the required columns in `localized-research.md`: primary query, native variants, market, volume/evidence, trend, observable competition, result weakness, intent, recommended page, confidence, and sources. Add a clear discard reason for important rejected candidates.

## 6. Select the Page Type

- Select a ficha only when one identifiable tool and its official routes answer the intent.
- Select a guide when the intent spans products, explains an installation/access route, or needs a comparative decision.
- Prioritize real demand with demonstrably weak results. Do not select a candidate solely for novelty, low competition, or an existing ficha in another language.

## 7. Create Native Content

- Put shared technical facts in `src/content/tools-base/<slug>.json` only after official verification.
- Put native editorial content in `src/content/tools/<lang>/<slug>.json`.
- Write directly in the target variant; do not machine-translate titles, FAQs, idioms, platform labels, or warnings.
- Match local terminology and prevalent platform routes while preserving the official-source policy.
- State in the summary, limitations, FAQ, and safety notes when an official installer does not exist.

## 8. Validate and Report

Verify official links, actual platforms, regional availability, pricing, privacy, legal claims, and review dates. Run the checks in `validation.md`; run `npm run build` whenever fichas or guides are created/changed. Report unresolved evidence rather than filling gaps with assumptions.
