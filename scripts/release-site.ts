import { mkdir, writeFile } from 'node:fs/promises';
import { PRIVACY, RELEASE } from '../src/release';

const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!,
  );
const page = (title: string, content: string) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)} · ${RELEASE.name}</title>
<style>body{margin:0;background:#f5f2e9;color:#263c30;font:18px/1.65 system-ui,sans-serif}main{max-width:720px;margin:auto;padding:36px 24px 64px}h1,h2{line-height:1.2}h1{font-size:42px}h2{font-size:24px;margin-top:36px}a{color:#34563f;text-underline-offset:4px;overflow-wrap:anywhere}nav{display:flex;gap:24px;flex-wrap:wrap}a:focus-visible{outline:3px solid #9b522f;outline-offset:4px}footer{border-top:1px solid #c3c8bb;margin-top:40px;padding-top:20px;font-size:15px}</style></head>
<body><main><nav aria-label="Main"><a href="index.html">Support</a><a href="privacy.html">Privacy policy</a></nav><h1>${escape(title)}</h1>${content}<footer>${escape(RELEASE.name)} · ${escape(RELEASE.publisher)}</footer></main></body></html>`;
async function main() {
  await mkdir('release/site', { recursive: true });
  await writeFile(
    'release/site/privacy.html',
    page(
      'Privacy policy',
      PRIVACY.map(
        ([heading, body]) => `<section><h2>${escape(heading)}</h2><p>${escape(body)}</p></section>`,
      ).join('\n'),
    ),
  );
  await writeFile(
    'release/site/index.html',
    page(
      'Cluewoven support',
      `<p>A little logic. A little mystery. Reconstruct the scene and find the culprit in 100 offline detective puzzles.</p><h2>Need a hand?</h2><p>Email <a href="mailto:${RELEASE.supportEmail}">${RELEASE.supportEmail}</a>. For puzzle problems, include the case number, app version, your device model, and what happened. Please avoid including personal information you do not want to share.</p><h2>Where is my progress?</h2><p>Progress is saved on your device. If the notebook cannot be opened, use Retry opening notebook. If saving fails, keep the app open and use Retry saving. Progress does not automatically sync between devices.</p><h2>Learn the rules</h2><p>Open Help in the game, then Try a practice scene. Hints start with testimony, explain eliminations, and reveal a position only when you request it.</p><h2>Sound and haptics</h2><p>Each can be switched off in Settings. The iPhone silent switch is respected.</p><h2>Privacy</h2><p>Read our <a href="privacy.html">privacy policy</a> for local saves and support correspondence.</p>`,
    ),
  );
  console.log(
    'Prepared release/site/index.html and privacy.html. Publish to HTTPS and set RELEASE.privacyUrl before submission.',
  );
}
void main();
