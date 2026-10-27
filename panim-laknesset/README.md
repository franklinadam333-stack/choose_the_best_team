# פנים לכנסת · Panim Laknesset

A Hebrew RTL informational seat-allocation simulator, built with Next.js App Router, TypeScript, Tailwind CSS and Lucide. No login, database or analytics. Political preferences stay in the browser's localStorage.

## Status: development simulator, not verified election information

The user-supplied `panim_laknesset_candidates_51_72.json` has now been integrated: **22 named pilot candidates** are visible by default, with 50 earlier anonymous slots retained for baseline changes. Internal candidate IDs remain stable. Party distribution of the imported records is 3 / 5 / 7 / 7 at positions 22–24 / 14–18 / 9–15 / 9–15 respectively. The imported names, affiliations and list positions are user-provided and **not independently verified**. Every imported record is marked `unverified`, has a supplied profile link, and retains a neutral silhouette because no licensed image was supplied. Search indexing remains disabled.

`src/data/candidates.json` is the single candidate-data source. `src/data/pilot-metadata.json` records the supplied file's provenance and its declared verification date separately from independent verification; `lastVerifiedAt` remains null on imported records. The app never treats a profile-page URL as an image or as proof of official list order. Sources are available in an expandable section on the results screen.

The full named 10-person acceptance example remains **blocked** because Tal Ohana and her position are absent from this file. The other nine supplied names are tested using the actual imported positions: the custom baseline produces 2/2/3 entries for those nine, without inventing the missing tenth record. The original ten-person test remains explicitly skipped.

To try the app without recording a party preference, choose **התנסות ללא בחירה פוליטית**. Normal mode shows named pilot records; anonymous test mode also includes missing slots that become eligible after baseline changes. Candidate selection and saved-session recovery use the same eligibility rule. The baseline reset restores the documented default; selection clearing preserves the baseline and initial intention. Scenario tabs support RTL arrow keys, Home and End. Missing images fall back to an inline icon. The app remains usable when localStorage is blocked, but progress then cannot survive a reload.

The homepage includes a rotating gallery titled **איזה ח"כ אתה מעדיף**, sampling five unique named records from the 22 supplied candidates on each visit. Manual controls, a fresh disjoint five-person draw, pause/play, reduced-motion support and keyboard interaction are provided. Gallery browsing does not record a candidate selection or voting intention; the simulator flow remains separate. Existing silhouette placeholders are used until licensed, verified portraits are available.

Restart is available at the top of every step. Global back/continue controls and clickable step navigation preserve choices, enforce completion requirements, and show 0% / 33% / 67% / 100% progress.

The results show a factual distribution across all four lists and identify the original intention. They do not recommend changing a vote or rank a party as the correct choice. A visible footnote explains the pilot data and simulation limits.

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

Replace remaining missing slots in `src/data/candidates.json` using authoritative sources, and independently verify the 22 imported pilot records before marking them verified. Keep official list order, unique candidate IDs and unique party/position pairs. Every record has:

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

No production account is connected to the current cloud machine. Do not put deployment tokens in Git or chat. Confirm the actual public deployment and its Open Graph image before claiming publication. A development preview with user-supplied pilot data is not a verified production election application.

## Privacy and accessibility

Session preferences never appear in URLs or share payloads. Sharing uses only the site's origin, with Web Share and clipboard fallback. The reset control removes intention, allocation and selections locally. No remote images/fonts or analytics are loaded. Hosting providers may retain ordinary request logs. Candidate cards and controls support keyboard use; status messages are announced; visualizations have text alternatives. The neutral silhouette is original project artwork. Noto Sans Hebrew is distributed under the SIL Open Font License, included in `public/fonts/OFL.txt`.
