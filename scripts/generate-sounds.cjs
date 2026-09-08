const fs = require('node:fs');
fs.mkdirSync('assets/sounds', { recursive: true });
for (const [name, notes] of Object.entries({
  tap: [640],
  error: [180, 140],
  success: [523, 659, 784, 1046],
})) {
  const rate = 22050,
    duration = name === 'tap' ? 0.065 : 0.12;
  const count = Math.floor(rate * duration * notes.length),
    pcm = Buffer.alloc(count * 2);
  for (let i = 0; i < count; i++) {
    const time = i / rate,
      note = Math.min(notes.length - 1, Math.floor(time / duration));
    const t = time - note * duration;
    const envelope = Math.min(1, t / 0.008) * Math.pow(1 - t / duration, 2);
    pcm.writeInt16LE(Math.round(Math.sin(2 * Math.PI * notes[note] * t) * envelope * 4500), i * 2);
  }
  const head = Buffer.alloc(44);
  head.write('RIFF');
  head.writeUInt32LE(36 + pcm.length, 4);
  head.write('WAVEfmt ', 8);
  head.writeUInt32LE(16, 16);
  head.writeUInt16LE(1, 20);
  head.writeUInt16LE(1, 22);
  head.writeUInt32LE(rate, 24);
  head.writeUInt32LE(rate * 2, 28);
  head.writeUInt16LE(2, 32);
  head.writeUInt16LE(16, 34);
  head.write('data', 36);
  head.writeUInt32LE(pcm.length, 40);
  fs.writeFileSync(`assets/sounds/${name}.wav`, Buffer.concat([head, pcm]));
}
