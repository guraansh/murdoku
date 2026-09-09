const fs = require('node:fs/promises');
const sharp = require('sharp');

async function main() {
  const svg = await fs.readFile('assets/brand.svg');
  // Apple store icons must be opaque, including the corners outside the artwork.
  await sharp(svg).flatten({ background: '#F5F2E9' }).png().toFile('assets/icon.png');
  await fs.mkdir('release/images', { recursive: true });
  await sharp(svg).resize(512, 512).flatten({ background: '#F5F2E9' }).png().toFile('release/images/play-icon.png');
  await sharp(svg).resize(64, 64).png().toFile('assets/favicon.png');
  const foreground = await sharp(svg).resize(660, 660).png().toBuffer();
  await sharp({ create: { width: 1024, height: 1024, channels: 4, background: '#00000000' } })
    .composite([{ input: foreground, left: 182, top: 182 }])
    .png()
    .toFile('assets/adaptive-icon.png');
  console.log('Generated opaque app/store icons, adaptive icon, and favicon from assets/brand.svg.');
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
