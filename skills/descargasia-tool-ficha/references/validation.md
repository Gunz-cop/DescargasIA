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
- Confirm no duplicate product or domain was created. Slug integrity of `alternatives`, missing base files, missing translations, and unknown category slugs are checked automatically by `npm run catalog:audit` — read its output instead of verifying them by hand.
- Read the grouped warnings from `catalog:audit`. "Relaciones editoriales que se pierden por falta de traducción" means the alternative you chose does not exist in that locale: the block is still filled by rotation, but your editorial pairing is lost there. Either accept it explicitly or pick an alternative that exists in the same locale.
- Confirm web-only, extension-only, store-only, GitHub-only, or documentation-led products explicitly say that no conventional installer exists.

## Locale Launch and Template Validation

Treat adding localized content and launching a locale as different decisions. Removing `noindex`, exposing locale routes in public navigation, or enabling a language selector can make a whole market discoverable even when the session only created a few fichas. Do not make those changes as a side effect of content work. If research from the same session recommends waiting to publish, preserve that state until the user explicitly authorizes the launch.

Language selection, alternate links, and `hreflang` are no longer a per-template concern: every page builds its alternates through `buildAlternates()` in `src/utils/links.ts`, and `npm run links:audit` fails the build if any page loses its self-reference, breaks hreflang reciprocity, or points `x-default` somewhere else. Do not hand-roll alternates in a new page — call the helper.

Likewise, never write an internal route by hand. Use `homeUrl`, `toolUrl`, `categoryUrl`, `pageUrl`, and `redirectUrl` from `src/utils/links.ts`. See `docs/enlazado-interno.md` for the URL map and the linking rules.

## Build

Run after creating or changing fichas or guides:

```bash
npm run build
```

This chains `catalog:audit` before compiling and `links:audit` after. Both exit
non-zero on a hard error, so a build that passes means no ficha silently failed
to render and no internal link, canonical, or hreflang regressed. Report the
grouped warnings; do not treat them as failures.

If LinkZip or another external shortener reports `fetch failed` but Astro still builds, report it as operational risk unless generated routes are wrong.

## Manual Review

Review at least one changed locale page and its relevant directory/home view:

- the official destination and platform are clear;
- no localized copy implies an unsupported installer;
- content is useful before and after the CTA;
- FAQ and official sources render;
- mobile presentation keeps the name, domain, and CTA recognizable.
