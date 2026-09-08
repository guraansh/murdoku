# Murdoku

A React Native + Expo detective puzzle game for Android and iOS, with a browser preview. Warm paper, illustrated suspects, colored floor plans, and 100 playable mysteries.

## Play locally

Requires Node.js 22.13 or newer.

```sh
npm install
npm start
```

Scan the terminal QR code with an Expo Go version compatible with SDK 57 on an Android phone or iPhone connected to the same network. The app has no backend, account, or API-key requirements. Fonts, illustrations, and cases are bundled; installed native builds can play offline. Expo Go development still needs the development server.

For a browser preview:

```sh
npm run web
```

For a faster preview of the production build, run `npm run export:web` then `npm run preview` and open `http://localhost:8082`.

## The game

Place all suspects and the victim on the scene using truthful statements. Each person appears exactly once, and no two people share a row or column. Furniture blocks a square. “Beside” means sharing an edge within the same room. North/south clues compare row positions; east/west clues compare columns. The murderer is the sole suspect in the victim’s room.

- 100 distinct, independently validated puzzles in ten chapters, progressing from 6 × 6 to 9 × 9.
- All cases are available immediately. Chapter browsing and a Next case action support a continuous campaign.
- Tap a portrait, then tap an empty square; select and tap an existing token to remove it.
- Elimination marks, undo, manual clue checkboxes, evidence checks, and optional explicit hints.
- Case briefing, rules guide, accusation, culprit explanation, and casebook progress.
- Device-local saves for placements, notes, history, hints, completion, and active play time.
- Timer pauses in dialogs, in the case library, and when the app is backgrounded.
- Mobile haptics, safe-area support, Android back handling, and responsive tablet/web layouts.
- On narrow screens, the selected person’s statement also appears beside the controls. Larger grids and suspect trays scroll horizontally to retain usable touch targets.
- A furniture key identifies every object by name and coordinate, including similar illustrations.

Hints reveal an authored position, or identify a placement to revisit; they are counted and never place a token automatically. Clue checkboxes are player annotations. The Check scene action evaluates the actual rules and statements. A correct completed board unlocks the accusation.

## The 100-case campaign

| Cases   | Difficulty   | Grid  | Progression                                                                 |
| ------- | ------------ | ----- | --------------------------------------------------------------------------- |
| 001–020 | Beginner     | 6 × 6 | Direct locations and furniture clues                                        |
| 021–040 | Intermediate | 6 × 6 | Relationships between suspects                                              |
| 041–060 | Challenging  | 7 × 7 | More suspects and longer deduction chains                                   |
| 061–080 | Expert       | 8 × 8 | Exclusions and relationships, without exact row/column clues                |
| 081–100 | Master       | 9 × 9 | Eight suspects, broad starting possibilities, and interconnected statements |

Each band contains two chapters of ten cases. Cases are ordered by a structural difficulty score within their band: remaining candidate squares, relational statements, exclusions, direct givens, and solver branching. Candidate counts increase on average across the five bands. These are estimated difficulty ratings and play times; human playtesting can refine them.

The original three mysteries retain their IDs, statements, layouts, and solutions at cases 001, 021, and 041, so existing saves continue to work. The other 97 cases have deterministic scenes and individual narrative briefings. Only the notebook statements and the game rules constrain positions; briefing details provide atmosphere.

## Verify

```sh
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
npx expo-doctor
npm run export
```

The engine tests solve all 100 puzzles independently without consulting their stored answers, reject ambiguity, and check truthful evidence, connected rooms, distinct scenes, increasing difficulty profiles, hints, undo, and compatibility with existing saves. Browser tests cover desktop and phone layouts, complete cases from every difficulty band, access to all ten chapters, Next case, wrong accusations, hints, persistence, corrupt saves, and pausing. The browser runner builds and serves the production web app on port 8082 automatically, or uses an existing preview server. Rebuild the preview after source changes before testing an existing server.

An existing Chromium installation can be selected with the `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` environment variable. Screenshots go to `artifacts/`; failure traces go to `test-results/`.

`npm run export` creates production JavaScript/Hermes bundles for Android, iOS, and web in `dist/`. This verifies bundling; it does not produce a signed APK or IPA or replace native-device testing.

## Build for phones

The EAS profiles are in `eas.json`. Follow [Expo’s build setup](https://docs.expo.dev/build/setup/) to sign in to your own Expo account and link the project when EAS prompts. Before distribution, set the intended app identifiers in `app.json`; the current development identifiers are `com.murdoku.game`.

```sh
# Internal Android APK
npm run build:android

# Internal iOS device build; requires Apple signing credentials
npm run build:ios

# iOS Simulator build
npx eas-cli build --platform ios --profile simulator

# Store build, once release metadata and credentials are configured
npx eas-cli build --platform all --profile production
```

Cloud builds can be initiated from Windows. Local iOS compilation requires macOS/Xcode. Signing, store submission, and real-device verification are separate release steps; no account connection or publication is performed by this project.

## Project map

| File                        | Purpose                                                          |
| --------------------------- | ---------------------------------------------------------------- |
| `App.tsx`                   | App state, lifecycle, navigation, and interaction handlers       |
| `src/game/casebook.json`    | The 100 bundled scenes, characters, clues, ratings, and answers  |
| `src/game/campaign.ts`      | Ten chapters and five difficulty bands                           |
| `scripts/generate-cases.ts` | Offline deterministic case authoring and independent validation  |
| `scripts/authoring/`        | Scene text, character pools, and the authoring solver            |
| `src/game/engine.ts`        | Rule evaluation, constraint solver, hints, undo, save validation |
| `src/game/useGame.ts`       | Hydration and ordered AsyncStorage writes                        |
| `src/ui/GameBoard.tsx`      | Accessible interactive floor plan                                |
| `src/ui/ClueNotebook.tsx`   | Statements and manual clue annotations                           |
| `src/ui/GameDialogs.tsx`    | Tutorial, hints, accusation, settings, and results               |
| `src/ui/Illustrations.tsx`  | Original vector portraits, furniture, and scene art              |
| `src/ui/theme.ts`           | Color and typography tokens                                      |
| `tests/`                    | Engine and browser verification                                  |

The checked-in catalog is ready to play without generation or search at app launch. To reproduce it, run `npm run cases:generate`, then `npm test`. The generator creates scenes, adds truthful constraints until only one solution remains, prunes unnecessary evidence while preserving each difficulty profile, and validates every answer with a separate solver before writing the catalog. It also writes a rating report to `artifacts/casebook-validation.json`.

When authoring new content, keep one person per grid row, use typed constraints, and require exactly one solution with exactly two people in the victim’s room. All furniture tiles are impassable. Keep existing case IDs tied to the same puzzle mechanics because device saves refer to those IDs; new scenes should receive new IDs.

Regenerate app icons from the editable `assets/brand.svg` with `npm run assets`.

The placement concept follows [Murdoku’s published rules](https://murdoku.com/pdf/preppers-bw.pdf). This implementation’s cases, characters, text, and vector illustrations were created for this project.
