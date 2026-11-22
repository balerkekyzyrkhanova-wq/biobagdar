// export the burned-in subtitle cues (window.SUBS) → subs.json, for core/render/srt.py
import fs from 'fs';
const LIB = process.env.LIB || '/root/lemo-opuscar';
const { openDemo, closeServer } = await import(LIB + '/core/render/page.mjs');
const dir = process.argv[2];
const { browser, page } = await openDemo(dir, { w: 1920, h: 1080, q: 'ss=1' });
const subs = await page.evaluate(() => window.SUBS);
fs.writeFileSync(dir + '/subs.json', JSON.stringify(subs.map(s => ({ t0: +s.t0.toFixed(2), t1: +s.t1.toFixed(2), text: s.text })), null, 1));
await browser.close(); closeServer?.(); process.exit(0);
