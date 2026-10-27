# פנים לכנסת · Panim Laknesset

A Hebrew RTL informational seat-allocation simulator, built with Next.js App Router, TypeScript, Tailwind CSS and Lucide. No login, database or analytics. Political preferences stay in the browser's localStorage.

## Status: development simulator, not verified election information

The supplied brief describes 72 pilot positions but includes no sourced ordered candidate dataset. `src/data/candidates.json` therefore contains **72 explicitly missing anonymous slots**, not invented candidate names, affiliations or portraits. Even the four proposed party identities require authoritative verification. Default selection shows verified candidates only (currently none). An explicit, opt-in test mode makes anonymous pilot slots selectable to exercise the entire flow. All results remain visibly marked as unverified. Search indexing is disabled.

The named 10-person acceptance case is **blocked**: party affiliations and list positions were not supplied. No mappings were invented to force the expected 3/3/4 result. Its test is explicitly skipped. Government election sources could not be accessed from the current environment (proxy returned 403).

To try the app without recording a party preference, choose **התנסות ללא בחירה פוליטית** on the first screen. This explicitly enables anonymous test mode and uses “undecided” as the initial intention, without preselecting candidates. The baseline reset restores the documented default; selection clearing preserves the baseline and initial intention. Scenario tabs support RTL arrow keys, Home and End. Missing images fall back to an inline icon, even when the placeholder image cannot load. Saved sessions are validated on restore, with stale selections removed and incomplete sessions returned to the appropriate step. The app remains usable when localStorage is blocked, but progress then cannot survive a reload.

## Local development

Use Node.js 24 (Next.js requires Node 20.9+). From this directory:

```sh
npm ci
npm run dev
```

For a production server:

```sh
npm test
npm run build
npm run start
```

## Tests

```sh
npm run validate:data
npm test
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

If the system already provides Chromium, omit browser installation and use:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:e2e
```

The browser runner starts the production server on port 3000. Tests cover the full four-step journey, mobile layouts, local persistence, selection limits, missing images, alternative allocations, invalid totals, RTL and keyboard activation. iPhone and Android projects emulate viewports/touch using Chromium; they do not establish native Safari or physical-device compatibility.

Unit tests check all 23,426 integer 50-seat baselines across 53/56/60 seats (70,278 allocations), exact sums, quota, tie-breaking, entry boundaries, selection reconciliation, factual comparisons and data integrity.

The committed Open Graph PNG is rendered with Chromium for correct Hebrew shaping. To regenerate after branding changes, run `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run generate:share` (or omit the executable override when using Playwright's installed browser). Regeneration is not required during deployment.

## Calculation

Each scenario starts from a valid 50-seat baseline. Hamilton largest remainder uses integer numerators modulo 50 to avoid floating-point ties. Ties follow the documented fixed order: Eisenkot, Bennett, Golan, Lieberman. Choices never affect allocations. Entry is `position <= partySeats`. This is not Israel's official Bader–Ofer calculation and does not model votes, thresholds, surplus-vote agreements or all 120 seats.

Alternative allocations are local to the current results view. They must sum to the active scenario to be confirmed. Switching scenarios returns to Hamilton allocation. The default Hamilton scenario and candidate selections are persisted; alternative drafts are deliberately not persisted.

## Supplying real data

Replace missing slots in `src/data/candidates.json` using authoritative sources. Keep official list order, unique candidate IDs and unique party/position pairs. Every record has:

`candidateId`, `fullNameHe`, `partyId`, `listPosition`, `imagePath`, `imageCredit`, `imageLicense`, `sourceUrl`, `lastVerifiedAt`, `verificationStatus`.

Use `verified` only with a sourced Hebrew name, verified party/position, HTTPS source and ISO verification date. Use `/silhouette.svg` until a correctly identified, licensed local portrait is available. Provide credit/license metadata for every non-placeholder photo. Never use an unrelated person's portrait. The UI suppresses images on unverified records. The validator can check metadata and structural consistency; a human must verify that a photo actually depicts the right person and its license permits reuse.

Keep coverage sufficient for the distributions offered to users. Controls allow up to 50 baseline seats for one party; a 60-seat scenario can therefore require 60 positions in that party. Missing and out-of-pilot positions are reported explicitly, not silently counted as known people. Future verified data can extend each list beyond the pilot boundaries.

Before production: verify party identities and ordered data, add the sourced named regression fixture, validate image rights, remove development-only messaging only when accurate, and enable search indexing only when ready.

## Deployment

Import `franklinadam333-stack/choose_the_best_team` in Vercel and select **Root Directory: `panim-laknesset`**. Framework: Next.js. Install/build commands are in `vercel.json`. No secrets are needed by the application. Optional `NEXT_PUBLIC_SITE_URL` sets a custom canonical origin; Vercel hostnames are otherwise detected automatically for share previews. Fonts are bundled locally, including the font used by the 1200×630 Open Graph image.

For CLI deployment, use a Vercel account authenticated in your own environment:

```sh
npx vercel deploy --prod --verify
```

No production account is connected to the current cloud machine. Do not put deployment tokens in Git or chat. Confirm the actual public deployment and its Open Graph image before claiming publication. A development preview with anonymous data is not a verified production election application.

## Privacy and accessibility

Session preferences never appear in URLs or share payloads. Sharing uses only the site's origin, with Web Share and clipboard fallback. The reset control removes intention, allocation and selections locally. No remote images/fonts or analytics are loaded. Hosting providers may retain ordinary request logs. Candidate cards and controls support keyboard use; status messages are announced; visualizations have text alternatives. The neutral silhouette is original project artwork. Noto Sans Hebrew is distributed under the SIL Open Font License, included in `public/fonts/OFL.txt`.
