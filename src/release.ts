import app from '../app.json';

export const RELEASE = {
  name: 'Cluewoven',
  version: app.expo.version,
  publisher: 'Guraansh Bhagchandani',
  supportEmail: 'guraanshpunjabi@gmail.com',
  // Set to the published HTTPS policy before building for store submission.
  privacyUrl: '',
};

export const PRIVACY = [
  [
    'Your game stays on your device',
    'Cluewoven works offline. The app stores puzzle placements, notes, undo history, completion, play time, hint counts, and settings on your device. It does not send this progress to the developer. Your operating system may include app data in device backups, depending on your settings.',
  ],
  [
    'No accounts, advertising, or tracking',
    'The app does not require an account and does not include advertising, analytics, or a developer-operated crash reporting service. Fonts, puzzles, illustrations, and sounds are bundled with the installed app. The app does not request access to your microphone, camera, contacts, or location.',
  ],
  [
    'When you contact support',
    'Contact support opens your email app. You choose whether to send the message. A puzzle report includes the case number, title, app version, and platform; it does not attach your saved game. If you send email, the developer receives your email address and the information you include, and uses it to answer and investigate your request. Email is handled by the email providers involved.',
  ],
  [
    'Your choices',
    'You can restart individual cases in Settings. You can remove local progress by deleting the app and its data; manage any device backups separately. To request deletion of support correspondence, email the address below. Support correspondence is kept only as long as needed to resolve the request and any related follow-up, unless retention is required by law.',
  ],
  [
    'Contact and changes',
    'Developer: Guraansh Bhagchandani. Contact: guraanshpunjabi@gmail.com. This policy describes the installed app, not development previews or the stores’ own services. If the app’s data practices change, this policy and the store disclosures will be updated. Last updated September 9, 2026.',
  ],
] as const;
