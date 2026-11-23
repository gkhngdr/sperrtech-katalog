// Siteyi ve PDF kaynak sayfalarını dist/ altına üretir: node build.mjs
import { mkdirSync, writeFileSync, readFileSync, cpSync, rmSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import QRCode from 'qrcode';
import { site, products, LANGS } from './src/lib.mjs';
import { printHtml } from './src/templates/print.mjs';
import { buildSite } from './src/templates/site.mjs';

const out = (p, s) => { mkdirSync(dirname(`dist/${p}`), { recursive: true }); writeFileSync(`dist/${p}`, s); };
const css = (f) => readFileSync(`src/styles/${f}`, 'utf8');

for (const d of ['dist/tr', 'dist/en', 'dist/print', 'dist/assets']) rmSync(d, { recursive: true, force: true });
mkdirSync('dist/assets', { recursive: true });
for (const d of ['fonts', 'images', 'vendor']) cpSync(`assets/${d}`, `dist/assets/${d}`, { recursive: true });

const qr = await QRCode.toString(`https://wa.me/${site.company.whatsapp}`, { type: 'svg', margin: 0, color: { dark: '#14171A', light: '#0000' } });
for (const lang of LANGS) out(`print/${lang}.html`, printHtml(lang, qr, css('print.css')));

await buildSite({ out, css, qr });
out('assets/site.js', readFileSync('src/scripts/site.js', 'utf8'));
console.log('dist/ hazır');

// İç notlar (data/notlar.json) varsa güncelleme notlarını üretir. Bu dosyalar depoya girmez.
if (existsSync('data/notlar.json')) {
  const notes = JSON.parse(readFileSync('data/notlar.json', 'utf8'));
  const list = (items) => items.map((x) => `- ${x}`).join('\n');
  let md = '# Sperrtech kataloğu: güncelleme notları\n\nBu dosya `node build.mjs` ile `data/notlar.json` içinden üretilir; elle düzenlemeyin. Yalnızca bu bilgisayarda durur, depoya yüklenmez.\n\nAşağıda, önceki katalogda yazıp kaynak katalogda karşılığı olmadığı için çıkarılan bilgiler ve sorulması gereken noktalar model bazında listelenmiştir.\n';
  for (const p of products) {
    const n = notes[p.code];
    if (!n) continue;
    md += `\n## ${p.code} · ${p.name.tr}\n\nÇıkarılanlar:\n\n${list(n.removed)}\n`;
    if (n.questions.length) md += `\nSorulacaklar:\n\n${list(n.questions.map((x) => `${site.labels[x.k].tr}: ${x.q}`))}\n`;
  }
  if (notes._genel) md += `\n## Genel\n\n${list(notes._genel)}\n`;
  writeFileSync('TEYIT-LISTESI.md', md);
}
