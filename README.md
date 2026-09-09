# Cluewoven

A React Native + Expo detective puzzle game for Android and iOS, with a browser preview. Warm paper, illustrated suspects, colored floor plans, and 100 playable mysteries.

Release preparation and external dependencies are tracked in [RELEASE.md](RELEASE.md). The display name is Cluewoven; legacy development identifiers and local save keys are retained until release account configuration is settled. Help includes a guided practice scene, hints progress from testimony to explanation to reveal, and solved cases offer spoiler-free result sharing. On small screens, use Enlarge board for 44px squares and swipe the suspect dock for larger portrait controls.

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

Witnesses give one to three short facts, with no narrative filler, coordinates, furniture row/column lookups, or fixed offsets. Evidence includes room alibis, landmark exclusions, either/or rooms, proximity comparisons, and ordered positions. “Closer” means a smaller row gap plus column gap, ignoring walls and furniture; ties do not count. For “North to south: Alice, me, Basil”, the speaker's row is strictly between Alice's and Basil's; the three people need not share a column. The in-game field guide explains these conventions.

- 100 distinct, independently validated puzzles in ten chapters, progressing from 6 × 6 to 9 × 9.
- All cases are available immediately. Chapter browsing and a Next case action support a continuous campaign.
- Tap a portrait, then tap an empty square; select and tap an existing token to remove it.
- Elimination marks, undo, manual clue checkboxes, evidence checks, and optional explicit hints.
- Case briefing, rules guide, accusation, culprit explanation, and casebook progress.
- Device-local saves for placements, notes, history, hints, completion, and active play time.
- Timer pauses in dialogs, in the case library, and when the app is backgrounded.
- Fixed play screen with a fitted board, suspect dock, paged testimony, and persistent action controls. Tablet landscape places the dock beside the board.
- Chapter and case selection without page scrolling. Help, briefings, and other long reference dialogs remain scrollable.
- Soft bundled sound effects for taps, errors, and solved cases; separate saved sound and haptic switches. iOS silent mode is respected. Native haptics distinguish selection, placement, rejection, and completion.
- Animated screen, testimony, and token entrances respect the system reduced-motion preference.
- An Objects panel pages through named furniture illustrations and coordinates without moving the board.

Hints reveal an authored position, or identify a placement to revisit; they are counted and never place a token automatically. Clue checkboxes are player annotations. The Check scene action evaluates the actual rules and statements. A correct completed board unlocks the accusation.

## The 100-case campaign

| Cases   | Difficulty   | Grid  | Progression                                                                 |
| ------- | ------------ | ----- | --------------------------------------------------------------------------- |
| 001–020 | Beginner     | 6 × 6 | Furniture clues, room alibis, and simple relationships                      |
| 021–040 | Intermediate | 6 × 6 | Relationships between suspects                                              |
| 041–060 | Challenging  | 7 × 7 | More suspects and longer deduction chains                                   |
| 061–080 | Expert       | 8 × 8 | Broader alternatives, exclusions, and comparisons between witnesses         |
| 081–100 | Master       | 9 × 9 | Eight suspects, broad starting possibilities, and interconnected statements |

Each band contains two chapters of ten cases. Every witness's own evidence leaves multiple possible squares before combining other witnesses and the row/column rules. The minimum increases from 2–3 squares in Beginner to 14–15 in Master, with a higher minimum in the second chapter of each band. Average candidate counts increase across all five bands. The original case order is retained; individual structural scores can vary within a band. Scores and play times are estimates that human playtesting can refine.

The original three mysteries retain their IDs, layouts, and solutions at cases 001, 021, and 041, with rebuilt clues. All 100 case identities, numbers, scenes, and answers survive the clue refresh, so existing saves continue to work. The other 97 cases have deterministic scenes and individual narrative briefings. The notebook and game rules constrain positions; briefing details provide atmosphere.

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

`npm run cases:refresh-clues` rebuilds concise evidence on the existing scenes. The authoring pass uses truthful observations to eliminate competing solutions, balances clue types, leaves several starting possibilities per witness, and removes redundant facts while retaining a statement for every suspect. It writes the catalog only after both solvers agree with every existing answer. Wording is rendered from typed evidence without reading solution positions. Both authoring commands apply the same deterministic pass. The test suite also compares the solvers against exhaustive independent oracles for the new rule types.

When authoring new content, keep one person per grid row, use typed constraints, and require exactly one solution with exactly two people in the victim’s room. All furniture tiles are impassable. Keep existing case IDs tied to the same puzzle mechanics because device saves refer to those IDs; new scenes should receive new IDs.

Regenerate app icons from the editable `assets/brand.svg` with `npm run assets`.

The placement concept follows [Murdoku’s published rules](https://murdoku.com/pdf/preppers-bw.pdf). This implementation’s cases, characters, text, and vector illustrations were created for this project.
