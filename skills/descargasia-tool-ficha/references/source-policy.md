# Source Policy

## Approved Official Destinations

Use these destinations when they are actually official:

- official product domain;
- official documentation domain;
- official GitHub organization/repository;
- Google Play listing by the official publisher;
- App Store listing by the official publisher;
- Microsoft Store listing by the official publisher;
- VS Code Marketplace or JetBrains Marketplace for official extensions;
- package manager docs when that is the official installation path.

## Avoid

- APKPure/APKMirror and other APK portals;
- Softonic-style download portals;
- reuploaded GitHub forks unless they are the actual upstream project;
- “portable” installers from unknown sites;
- cracked, unlocked, premium-free, modded, or patched builds;
- SEO landing pages that only iframe or wrap official apps.

## Trust Levels

- `official`: direct official product source or official store listing.
- `verified`: trusted open-source/upstream or recognized installation path, especially when there is no single vendor download.
- `pending-review`: useful entry exists but official status or platform availability needs more verification.

## No-Installer Clarifications

If a tool does not have a desktop installer, say so in:

- `limitations`;
- `editorialSummary`;
- at least one `editorialSections` block;
- FAQ;
- `safetyNotes`.

Examples:

- Midjourney: no independent desktop installer; use web/Discord flow.
- GitHub Copilot: extension/integration, not a standalone editor.
- Perplexity: web/app/store/PWA; avoid generic desktop installers.
- Runway/Luma: cloud web tools, not classic desktop video editors.
