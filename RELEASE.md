# Cluewoven release work

Publisher: Guraansh Bhagchandani. Public support: guraanshpunjabi@gmail.com.

The user authorized choosing an original name because they have no permission to use Murdoku. Working release name: **Cluewoven**. Exact-name web searches and searches limited to indexed Apple App Store and Google Play pages returned no results on September 9, 2026. This is an initial collision check, not proof of trademark or store-name availability. Verify the actual store consoles before final submission. The existing EAS slug/project and development identifiers have not been migrated yet; preserve the legacy local save key so existing test installations retain progress.

## Requirement tracking

- Interactive practice tutorial: implemented, replayable from Help, teaches selection/placement, marking, the remaining row/column, and accusation in an isolated 3x3 scene. Desktop and phone browser tests verify wrong actions, completion, unchanged campaign placements, and replay. Phone completion screenshot visually inspected.
- Progressive evidence/deduction/reveal hints: implemented with highlighted testimony, rule-based candidate elimination explanations, and a separately requested final reveal. One lead counts once across all stages. Explanations distinguish remaining possibilities from a proven single position. Browser save/persistence test updated and passed on desktop and phone. Full engine checks running.
- About/support, case-specific email draft, version, credits, and readable offline privacy policy: implemented; native email handling and full license notices still need verification. Email is not sent automatically.
- Privacy publication: pending a public HTTPS location. `src/release.ts` holds policy text and the URL setting. Review support-correspondence retention wording with the publisher before publication; confirm disclosures against the final native builds and any later SDK changes.
- Save-read recovery: implemented, blocks edits and all writes until successful read, with retry. Write failures preserve the live game and offer retry. Four Playwright tests passed in installed Chrome using desktop and Pixel 7 viewport projects. TypeScript and production web export passed for the save change. Native storage testing remains pending.
- Accessibility: added optional 44px board squares, larger scrollable suspect controls, wrapping names, explicit web expanded states, and room/occupancy semantics. Four targeted browser accessibility checks passed after fixing whole-page sideways scrolling. See `release/ACCESSIBILITY.md`. Native assistive-technology and device usability remain pending. Pre-existing user edits to GameBoard.tsx and PlayScreen.tsx were preserved and extended.
- Chapter celebrations and spoiler-free sharing: implemented. Completed chapters show a trophy panel; the result preview shares only app name, case number, elapsed time, and hint count. Native uses the system text share sheet; web uses Web Share or clipboard/selectable-text fallback. Image-file export is not implemented. Native share-sheet verification remains pending.
- Branding: display name and README changed to Cluewoven. Existing original vector mark retained; regenerated opaque 1024px app icon and 512px Play icon (dimensions and lack of alpha verified). Final native identifiers remain pending account configuration.
- Store materials: descriptions/review notes in `release/STORE-LISTING.md`; evidence-based age-rating and privacy questionnaire drafts in `release/DISCLOSURES.md`. Static support/privacy pages generated in `release/site` by `npx tsx scripts/release-site.ts`. Final native screenshots and actual console submissions remain pending.
- Signed builds and TestFlight/Google testing: pending account inspection, credentials, devices, and testers. Do not equate a web export with a signed native build.

Latest verification: TypeScript and web export passed after the About/privacy and display-name changes. All six targeted Playwright checks passed across desktop and phone projects (save recovery and support/privacy navigation). The phone support screenshot was visually inspected; text and controls fit. Native email delivery is not verified and no email was sent.

Tutorial/hint verification: production web export and six browser checks passed (practice flow/replay, support navigation, and the updated three-stage hint/persistence flow, on desktop and phone). All 222 engine tests passed, including rule-based hint candidate checks throughout all 100 cases. Final hint wording was then corrected to avoid claiming the victim is always placed last; this is a wording-only change. Actual native-device and screen-reader checks remain open.

Celebration/sharing verification: four desktop/phone browser checks passed for completed versus incomplete chapters and the exact shared payload, using a mocked Web Share destination (nothing sent). Corrected the test expectation to match the established zero-padded timer. The phone share preview was visually inspected; then its backdrop was made opaque to avoid revealing the solved board in a manual screenshot. TypeScript and web export passed after that change. Static support/privacy navigation and 390px layout verified; support page visually inspected. Neither site is deployed.

## Release gates

The user confirmed they do not have Apple/Google developer accounts, testing devices/testers, or web hosting (September 9, 2026). These are external release blockers, not completed steps. A read-only `eas whoami` found an existing signed-in account named `alexb12321`, matching the existing project owner but not the supplied publisher name; verify account ownership/use with the user before any build upload or project migration. No account changes, builds, or uploads were made.

Publish a working privacy/support website; set its real HTTPS URL in the app and store listings. Verify the store name and signing/account ownership before creating final native app identifiers. Test actual iPhone, iPad (tablet support is enabled), and Android devices, including large text, screen readers, small 9x9 boards, offline startup, background/resume, email fallback, and progress recovery. Complete any required Google closed testing period (currently 12 continuously opted-in testers for 14 days for applicable new personal accounts). Get explicit authorization before sending outreach or publishing store releases.

## Local verification

```powershell
npm run typecheck
npm test
npm run export:web
$env:PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
npx playwright test tests/e2e/storage.spec.ts
```

The configured Playwright browser was missing; installed Chrome worked. Rebuild the web export before testing against an already-running preview server.
