// Kaynak görselleri (assets/source) siteye ve PDF'e uygun hale getirir: node images.mjs
import sharp from 'sharp';
import { readdirSync, mkdirSync } from 'node:fs';
mkdirSync('assets/images', { recursive: true });
for (const f of readdirSync('assets/source/cutout')) {
  const code = f.replace('.png', '');
  const img = sharp(`assets/source/cutout/${f}`).trim({ threshold: 12 });
  const buf = await img.png().toBuffer();
  const m = await sharp(buf).metadata();
  await sharp(buf).webp({ quality: 88, alphaQuality: 90 }).toFile(`assets/images/${code}.webp`);
  await sharp(buf).resize({ width: 480, height: 480, fit: 'inside' }).webp({ quality: 82 }).toFile(`assets/images/${code}-sm.webp`);
  console.log(code, m.width, m.height);
}
// Uygulama ekranları: maskeyi alfa kanalı olarak uygula
const app = await sharp('assets/source/app.png').removeAlpha().raw().toBuffer({ resolveWithObject: true });
const mask = await sharp('assets/source/app-mask.png').extractChannel(0).raw().toBuffer();
const rgba = Buffer.alloc(app.info.width * app.info.height * 4);
for (let i = 0; i < mask.length; i++) { rgba[i * 4] = app.data[i * 3]; rgba[i * 4 + 1] = app.data[i * 3 + 1]; rgba[i * 4 + 2] = app.data[i * 3 + 2]; rgba[i * 4 + 3] = mask[i]; }
const appPng = await sharp(rgba, { raw: { width: app.info.width, height: app.info.height, channels: 4 } }).png().toBuffer();
await sharp(appPng).trim().webp({ quality: 85 }).toFile('assets/images/app.webp');
// PDF için: düz zemine oturtulmuş JPEG (PDF boyutunu küçük tutar)
// Beyaz zemin + CSS'te mix-blend-mode: multiply, her panel renginde kenarsız görünür.
const STAGE = '#ffffff';
for (const f of readdirSync('assets/source/cutout')) {
  const code = f.replace('.png', '');
  const buf = await sharp(`assets/source/cutout/${f}`).trim({ threshold: 12 }).png().toBuffer();
  await sharp(buf).flatten({ background: STAGE }).extend({ top: 8, bottom: 8, left: 8, right: 8, background: STAGE }).jpeg({ quality: 86, mozjpeg: true }).toFile(`assets/images/${code}-print.jpg`);
}
await sharp(await sharp(appPng).trim().png().toBuffer()).resize({ width: 1500 }).flatten({ background: '#ffffff' }).jpeg({ quality: 82, mozjpeg: true }).toFile('assets/images/app-print.jpg');
