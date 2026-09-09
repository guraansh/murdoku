# Native beta test handoff

Status: **not started**. The publisher has no Apple/Google developer accounts, test devices/testers, or hosting yet. No signed store build or store upload has been produced by this release work. An Expo account named `alexb12321` is already signed in on this computer; confirm authorization to use it before uploading source or changing its project.

## Setup order

1. Register the publisher's Apple Developer and Google Play developer accounts and complete their identity requirements. The publisher must handle identity checks, agreements, and payments.
2. Confirm the Expo account/project to use. Choose permanent Cluewoven native identifiers before first store submission; preserve `@murdoku/notebook/v1` as the existing local save key. Renaming the native identifier creates a separate installation and does not automatically transfer the old app's storage.
3. Publish `release/site` to public HTTPS. Set the real policy URL in `src/release.ts`, rebuild the site if its disclosures change, and add policy/support URLs to both stores. Review the site's hosting logs and support-retention wording.
4. Create internal native builds with the preview EAS profile. An iOS physical-device preview requires signing/device registration; Android preview outputs an APK. Use production only after metadata and signing are settled.
5. Run the device checks below, record exact build number, OS, device, result, and evidence. Fix failures and retest the affected flows.
6. Upload the reviewed production builds to TestFlight and Google Play internal/closed testing. These steps require account access and credentials. Run the applicable Google closed test (currently 12 testers continuously opted in for 14 days for new personal accounts), gather actual feedback, and answer production-access questions truthfully.
7. Capture final native store screenshots, complete the store questionnaires from the drafts, and review the submission package with the publisher before publishing.

## Device matrix and evidence sheet

Use at least a small supported iPhone, an iPad because tablet support is enabled, and a small Android phone. Additional older/slower devices improve confidence. Browser device emulation does not count as these checks.

| Flow | Expected behavior | Device / OS / build | Result / evidence |
| --- | --- | --- | --- |
| Install and first launch | Correct name/icon, readable startup, all bundled assets load | Pending | Not tested |
| Airplane-mode cold launch | Campaign and sounds/fonts usable offline | Pending | Not tested |
| Practice | Every lesson works; wrong actions teach; campaign stays unchanged | Pending | Not tested |
| Beginner and master cases | Select all suspects, pan larger board, place/remove/mark/undo | Pending | Not tested |
| Hints | Evidence → explanation → final reveal; count increments once | Pending | Not tested |
| Accusation/results | Wrong accusation handled; correct result and chapter celebration | Pending | Not tested |
| Share | Only previewed result sent; cancellation safe; iPad popover works | Pending | Not tested |
| Email | Correct case/version draft; no send without user action; missing mail app fallback | Pending | Not tested |
| Save lifecycle | Force-close/reopen retains moves, notes, history, settings, completion | Pending | Not tested |
| Storage failure injection | Read failure cannot overwrite stored data; read/write retries recover | Pending | Not tested |
| Background/pause | Timer stops in background, dialogs, library; resumes correctly | Pending | Not tested |
| VoiceOver/TalkBack | Correct reading order, named rooms/squares/people, modal focus and close | Pending | Not tested |
| Native large text | Full testimony readable, controls reachable, no inaccessible clipping | Pending | Not tested |
| Reduced motion | Animations respect system preference | Pending | Not tested |
| Silent mode/haptics | iOS silent mode respected; both preferences independent and persistent | Pending | Not tested |
| Rotation/system back | Tablet layouts usable; Android back dismisses modal then returns to library | Pending | Not tested |
| Privacy/permissions | No unexpected permission prompts or production network collection | Pending | Not tested |
| Upgrade | Install new build over previous same-identifier build; progress survives | Pending | Not tested |

Record tester issues by case number, reproduction steps, expected/actual result, device/build, and screenshot or recording. Do not copy private email correspondence into the public store materials. Completion requires real results in this table, not merely a signed build or an elapsed calendar period.
