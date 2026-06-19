# Workflow

## 1. Inventory

- List existing `src/content/tools/*.json`.
- Detect duplicates by normalized name and official domain.
- Check alternatives point to existing slugs.
- Prefer updating an existing ficha over creating a duplicate slug.

## 2. Research

For each requested or discovered tool:

- Find official website.
- Find official install/access channels per platform.
- Verify whether “download for PC/Mac/mobile” is real, web-only, extension-only, store-only, GitHub-only, or unavailable.
- Find official documentation for installation if the tool is technical.
- Record official sources in `officialSources`.

Use web verification for current links. Prefer primary sources. Use secondary sources only to understand ambiguity, not as official download destinations.

## 3. Classification

Assign existing categories where possible:

- `asistentes-ia`
- `programacion`
- `modelos-locales`
- `generacion-imagenes`
- `video-ia`

If the repo already has extra categories, use them when they are more accurate. Do not create narrow categories for a single tool unless the site taxonomy already supports that direction.

## 4. Content Creation

Create a complete JSON ficha:

- `bestFor`: 4 concise use cases.
- `limitations`: 3 practical limits or caveats.
- `editorialSummary`: 1 paragraph, unique.
- `editorialSections`: 3-5 sections, each with 2 paragraphs, unique and user-centered.
- `faq`: 4 questions targeting real search intent.
- `safetyNotes`: concrete warnings tied to actual confusion.

## 5. Integration

- Add visual styles for new slugs in `src/components/ToolCard.astro` only when the default category style is too generic.
- Add visual accents in `src/pages/[slug].astro` for hero monograms when useful.
- Do not alter architecture unless required by schema/build errors.

## 6. Validation

- Run a JSON/slug integrity check.
- Run `npm run build`.
- Review build output for new page count and route generation.
- Treat external shortener failures as operational risk if the build still completes.
