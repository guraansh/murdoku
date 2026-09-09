# Store questionnaire draft

Prepared September 9, 2026 for Cluewoven, published by Guraansh Bhagchandani. These are evidence-based draft answers, not completed console submissions. Recheck the final signed binary, SDKs, and actual console wording before submitting.

## Content and age rating

The game is a murder-mystery puzzle collection. Every case has a victim, and the player identifies a murderer. Portraits and furniture are stylized illustrations; there is no animated killing, blood, gore, or interactive combat. A keyword inventory of the 100 bundled cases found explicit death/murder-related terms in 98 cases; the shared game rules supply the theme in the others. The same inventory found no matches for the listed alcohol, weapon, sexual, or drug terms. Keyword absence is supporting evidence only, not a substitute for reading the stories and checking the images.

| Questionnaire topic | Draft response / content to disclose |
| --- | --- |
| Mature themes | Present and recurring: fictional death, murder, suspicion, and investigation. Do not answer “none” merely because the artwork is gentle. |
| Violence | Death/murder references are central. No graphic violence or on-screen acts of violence. Map this distinction to each store's current textual-violence/depic­tion questions. |
| Horror/fear | Mild mystery and death-related suspense; no jump scares or frightening imagery identified. Review the store's definition before choosing frequency. |
| Sexual content/nudity | None identified in current content. |
| Profanity/crude humor | None identified; final editorial review still required. |
| Alcohol/tobacco/drugs | None identified by the initial catalog scan; review titles such as “A Toast Too Many” in context rather than assuming an alcoholic depiction. |
| Gambling/simulated gambling/loot boxes | None. |
| Contests, real-money prizes, purchases | None implemented. |
| User-generated content, chat, social network | None. The external share sheet shares a fixed result chosen by the player; there is no in-app feed. |
| Unrestricted web browsing | No embedded browser. Support email and future policy website use external apps. |
| Medical/wellness advice | None. |
| Parental controls/age assurance | None implemented. Do not claim them. |

Let each console calculate the rating from the truthful answers. No numeric age rating is asserted here. Do not select Apple's Kids Category or child-directed Google target audiences without a separate decision and review.

References: [Apple rating definitions](https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions/), [Apple questionnaire instructions](https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating/).

## Data inventory

| Data / behavior | Location and recipient | Draft disclosure treatment |
| --- | --- | --- |
| Puzzle placements, notes, undo history, completed cases, timer, hints, preferences | AsyncStorage on device | No developer transmission. Local-only data is not a server collection claim. OS backup behavior must be reflected in policy. |
| Fonts, images, sounds, puzzles | Bundled app assets | No remote font or content service required for installed play. |
| Advertising identifiers, analytics, tracking SDK, crash telemetry service | None intentionally included in package dependencies or app code | Draft: no tracking, no ads, no analytics collection. Verify native dependency manifests before finalizing. |
| Support email | External email app; sent only if the player chooses | Developer can receive sender address and message. Case report pre-fills case number/title, app version, and platform. No saved game attached. Policy covers support use and deletion requests. |
| Shared result | Player-selected external app or web clipboard | Case number, elapsed time, hint count, and app name only. No culprit, board, or personal account identifier. User initiates and sees preview. |
| Public support/privacy website | Hosting provider, once selected | Hosting access logs may include IP and browser details. Inspect the chosen host's behavior and extend the website policy before publication. No host is selected yet. |

Apple: “Data Not Collected” is a candidate for the installed game only if the final binary has no transmission and voluntary support meets **all** optional-disclosure conditions. Otherwise disclose email address and customer-support content for app functionality as appropriate. Do not automatically assume email is exempt. [Apple privacy definitions and optional disclosure](https://developer.apple.com/app-store/app-privacy-details/).

Google: verify the final build before choosing “No” for collected/shared data. Local-only storage is distinct from off-device collection. Review the user-initiated transfer exception for the external share action and how the final support workflow is classified. Do not claim transport encryption for a support email chain that the app does not control. [Google Data safety definitions](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en-GB), [User Data policy](https://support.google.com/googleplay/android-developer/answer/10144311?hl=en).

No account creation exists, so there is no in-app account-deletion flow to declare. Individual case reset is available; uninstall/app-data deletion removes local saves subject to OS backups. Support deletion requests go to guraanshpunjabi@gmail.com. The publisher must review and follow the drafted correspondence-retention policy.

## Native review still required

Inspect Android's merged permissions and iOS privacy manifests/required-reason API declarations in the actual store builds. Microphone recording is disabled in the Expo Audio plugin configuration. Do not add blanket privacy-manifest reasons without checking which APIs are used. Review OS backup defaults, networking during cold startup/offline play, and external sharing/email behavior on real devices. Store-controlled diagnostics and development-server traffic must not be confused with the installed production app's own data collection.
