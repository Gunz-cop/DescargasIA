# Schema Contract

Do not change the JSON contract during ordinary localized ficha work. Keep factual product data and native editorial copy separate.

## Files

- `src/content/tools-base/<slug>.json`: shared, verified product data.
- `src/content/tools/<lang>/<slug>.json`: editorial content written natively for that language route.

The current contract does not store country, variant, demand, SERP, or opportunity-matrix fields in the ficha JSON. Keep that research in the task evidence/handoff unless the user explicitly requests a contract change.

## Shared Base Fields

```json
{
  "name": "Tool Name",
  "officialWebsite": "https://official.example",
  "categories": ["asistentes-ia"],
  "platforms": {},
  "pricingModel": "free|freemium|paid|enterprise|unknown",
  "requiresAccount": true,
  "tags": [],
  "alternatives": [],
  "initials": "TN",
  "screenshotUrl": null,
  "trustLevel": "official|verified|pending-review",
  "lastReviewed": "YYYY-MM-DD",
  "officialSources": []
}
```

Supported platform keys: `web`, `windows`, `mac`, `linux`, `android`, `ios`.

Supported platform types: `official-site`, `app-store`, `web-app`, `documentation`, `official-installer`, `github-repo`, `package-manager`.

Include a platform only when an official or useful verified access route really exists. `alternatives` must reference existing base slugs.

## Localized Editorial Fields

Each `src/content/tools/<lang>/<slug>.json` can include:

```json
{
  "shortDescription": "Max 180 chars.",
  "longDescription": "Native description.",
  "bestFor": [],
  "limitations": [],
  "safetyNotes": [],
  "editorialSummary": "",
  "editorialSections": [],
  "faq": []
}
```

The currently supported optional support fields are `spanishSupport`, `italianSupport`, and `swedishSupport`; use only the field that the existing collection supports and only with verified information. Do not add a generic localization field without explicit authorization.
