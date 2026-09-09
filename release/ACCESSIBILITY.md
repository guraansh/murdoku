# Small-screen accessibility pass

Scope: production web build at 320×568, master case 100, board enlargement, suspect selection, and About/Privacy with 150% browser text. This is a bounded browser audit, not a native screen-reader or WCAG certification. Chrome was used through the project's established Playwright setup; no Browser skill/in-app browser control was available in this environment. Screenshots below were captured and inspected during this audit run.

## 1. Compact master scene — usable, but targets were too small

![Compact master scene before changes](../artifacts/audit-01-small-master-before.png)

Room names and strong boundary lines already supplement colour. DOM measurements found 30px board squares and roughly 30px-wide suspect buttons. Names were visibly truncated. Added optional 44px board squares and a horizontally scrollable suspect dock with at least 60px-wide controls and wrapping names. The first attempted capture was a blank transition frame and was rejected before this accepted screenshot.

## 2. Larger board — verified scrolling and target sizes

![Larger board after correction](../artifacts/audit-02-phone-large-board.png)

The enlarged board is intentionally wider than the phone and scrolls inside its own container. All cells retain coordinate, room, and occupant/object labels. The test reaches every suspect, confirms minimum target dimensions, and reaches Check scene. Visual inspection initially caught the whole page shifting sideways; the board container was constrained and a regression assertion now verifies the page's horizontal scroll position stays zero. A missing web expanded state on the toggle was fixed. The screenshot also showed a truncated case heading; the heading and location were subsequently allowed to wrap.

## 3. Enlarged support text — usable with vertical scrolling

![Support page with 150 percent browser text](../artifacts/audit-03-desktop-large-text.png)

The dialog heading wraps, content scrolls, the privacy button remains reachable, and the close button remains accessible. This test enlarges CSS font and line-height values; it does not reproduce iOS Dynamic Type or Android system font scaling. The screenshot shows a scrolled content position, not missing content.

## Evidence and remaining checks

Four browser accessibility checks passed after the board scrolling and expanded-state fixes. The earlier full suite passed 30/32 checks; the two failures were an obsolete assertion requiring the already-scrollable screen to fit all controls at once. The replacement verifies reachable controls on small phones and tablets and passed. A later phone campaign-navigation failure passed on rerun; retain it as an intermittent observation until the final full run is green.

Real-device verification remains required for VoiceOver/TalkBack reading order, focus when dialogs change, native large-text settings, physical touch accuracy, reduced motion, iPad sharing, offline startup, and native save failures. Current semantics and browser checks are supporting evidence only. No real iPhone, iPad, or Android device was available.
