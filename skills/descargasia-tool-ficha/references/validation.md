# Validation

## Research Validation

- Confirm the market brief and research date are present.
- Ensure each selected opportunity has evidence type, confidence, and source URLs.
- Check that native queries are not literal translations presented as demand evidence.
- Confirm rejected high-priority candidates have a reason: insufficient demand, strong SERP, official result already satisfies the need, weak factual fit, or wrong page type.

## Ficha Validation

- Verify each official URL, publisher/store identity, platform type, regional availability, and `lastReviewed`/`lastChecked` date.
- Recheck factual claims for privacy, legal status, pricing, account requirements, and offline use from primary sources.
- Confirm base data is in `src/content/tools-base/` and native copy is in the intended `src/content/tools/<lang>/` folder.
- Check that copy, headings, FAQs, and warnings are native to the target market, not translated from another locale.
- Confirm every alternative references an existing base slug and no duplicate product/domain was created.
- For each ficha language, confirm every alternative also has `src/content/tools/<lang>/<alternative>.json`. A base-only slug disappears from that localized page without a build error or warning; if it is absent, explicitly accept the smaller visible set or choose an alternative that exists in the same locale.
- Confirm web-only, extension-only, store-only, GitHub-only, or documentation-led products explicitly say that no conventional installer exists.

## Locale Launch and Template Validation

Treat adding localized content and launching a locale as different decisions. Removing `noindex`, exposing locale routes in public navigation, or enabling a language selector can make a whole market discoverable even when the session only created a few fichas. Do not make those changes as a side effect of content work. If research from the same session recommends waiting to publish, preserve that state until the user explicitly authorizes the launch.

When touching language selection, alternate links, or `hreflang`, inspect all relevant templates before completing the work. In this project that normally includes `src/components/Home.astro`, `src/pages/[lang]/[slug].astro`, `src/pages/[lang]/categoria/[slug].astro`, and `src/layouts/BaseLayout.astro`; also search the full template roots because new pages can implement their own alternates. A successful build does not reveal that one template still applies a stale hardcoded exclusion.

From the repository root, use a focused search such as:

```bash
rg -n -e 'filter\(\(l\) =>' -e '=== lang' -e '!== lang' -e "['\"](es|it|sv)['\"]" src/pages src/components src/layouts
```

Review the matches rather than replacing them mechanically: translation copy can legitimately compare `lang` with a literal, but alternate-link filters must use the same current-locale criterion. Report any legacy exclusions that remain outside the requested change.

## Build

Run after creating or changing fichas or guides:

```bash
npm run build
```

If LinkZip or another external shortener reports `fetch failed` but Astro still builds, report it as operational risk unless generated routes are wrong.

## Manual Review

Review at least one changed locale page and its relevant directory/home view:

- the official destination and platform are clear;
- no localized copy implies an unsupported installer;
- content is useful before and after the CTA;
- FAQ and official sources render;
- mobile presentation keeps the name, domain, and CTA recognizable.
