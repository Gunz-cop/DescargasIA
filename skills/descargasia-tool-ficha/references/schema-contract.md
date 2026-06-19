# Schema Contract

Tool fichas live in `src/content/tools/<slug>.json`.

Required core fields:

```json
{
  "name": "Tool Name",
  "slug": "tool-slug",
  "shortDescription": "Max 180 chars.",
  "longDescription": "Plain description.",
  "officialWebsite": "https://official.example",
  "categories": ["asistentes-ia"],
  "platforms": {},
  "pricingModel": "free|freemium|paid|enterprise|unknown",
  "requiresAccount": true,
  "spanishSupport": "yes|partial|no|unknown",
  "tags": [],
  "alternatives": [],
  "initials": "TN",
  "screenshotUrl": null,
  "bestFor": [],
  "limitations": [],
  "editorialSummary": "",
  "editorialSections": [],
  "faq": [],
  "safetyNotes": [],
  "trustLevel": "official|verified|pending-review",
  "lastReviewed": "YYYY-MM-DD",
  "officialSources": []
}
```

Platform keys:

- `web`
- `windows`
- `mac`
- `linux`
- `android`
- `ios`

Platform `type` values:

- `official-site`
- `app-store`
- `web-app`
- `documentation`
- `official-installer`
- `github-repo`
- `package-manager`

Rules:

- Include only platforms that truly exist or have a useful official access/install page.
- Use `web` for official web apps, official landing pages, official docs, or official GitHub entry points.
- Use `documentation` when the correct “download” route is an installation guide.
- Use `github-repo` only for the official repo or recognized upstream project repo.
- `alternatives` must reference existing slugs. If the alternative is not in the repo, either omit it or create that ficha too.
- `officialSources` should include the official website and proof pages used for platform decisions.
