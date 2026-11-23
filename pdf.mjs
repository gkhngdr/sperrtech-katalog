// dist/print/*.html sayfalarından PDF katalogları üretir: node pdf.mjs
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { site, LANGS } from './src/lib.mjs';

const browser = await chromium.launch();
for (const lang of LANGS) {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(`dist/print/${lang}.html`).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const file = `dist/${site.brand}-Katalog-${site.year}-${lang.toUpperCase()}.pdf`;
  await page.pdf({ path: file, format: 'A4', printBackground: true, preferCSSPageSize: true, tagged: true });
  console.log(file);
  await page.close();
}
await browser.close();
