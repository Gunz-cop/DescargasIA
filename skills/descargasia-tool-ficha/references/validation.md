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
- Confirm web-only, extension-only, store-only, GitHub-only, or documentation-led products explicitly say that no conventional installer exists.

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
