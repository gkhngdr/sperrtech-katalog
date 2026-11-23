// Ortak yardımcılar: veri yükleme, çeviri, ikonlar, gövde çizimleri.
import { readFileSync } from 'node:fs';

const read = (p) => JSON.parse(readFileSync(new URL(`../data/${p}`, import.meta.url), 'utf8'));
export const site = read('site.json');
export const products = read('products.json');
export const LANGS = ['tr', 'en'];

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** Çok dilli alanı seçilen dilde döndürür. */
export const tr = (lang) => (o) => (o == null ? '' : typeof o === 'string' ? o : esc(o[lang] ?? o.tr));
export const ui = (lang, key) => esc(site.ui[key][lang]);
export const groupOf = (p) => site.groups.find((g) => g.key === p.group);
export const publishedSpecs = (p) => p.specs;
export const stat = (s, lang) => ({ v: lang === 'en' && s.en_v ? s.en_v : s.v, u: lang === 'en' && s.en_u ? s.en_u : s.u || '', l: s[lang] });
export const specValue = (p, key, lang) => publishedSpecs(p).find((s) => s.k === key)?.[lang] ?? '';
export const waLink = (lang, code) =>
  `https://wa.me/${site.company.whatsapp}?text=${encodeURIComponent(code ? site.ui.quoteMsg[lang].replace('{code}', code) : site.ui.quoteMsgGeneral[lang])}`;

export const fontFaces = (base) => {
  const fam = { 'space-grotesk': ['Space Grotesk', [500, 600, 700]], 'ibm-plex-sans': ['IBM Plex Sans', [400, 500, 600]], 'ibm-plex-mono': ['IBM Plex Mono', [400, 500]] };
  return Object.entries(fam)
    .flatMap(([file, [name, ws]]) =>
      ws.flatMap((w) => [
        `@font-face{font-family:'${name}';font-weight:${w};font-display:swap;src:url(${base}/${file}-latin-ext-${w}-normal.woff2) format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}`,
        `@font-face{font-family:'${name}';font-weight:${w};font-display:swap;src:url(${base}/${file}-latin-${w}-normal.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}`,
      ]),
    )
    .join('\n');
};

const ICONS = {
  face: 'M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M9 10v1M15 10v1M9.5 15a3.5 3.5 0 0 0 5 0',
  palm: 'M18 11V6a2 2 0 0 0-4 0M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15',
  fingerprint: 'M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4M14 13.12c0 2.38 0 6.38-1 8.88M17.29 21.02c.12-.6.43-2.3.5-3.02M2 12a10 10 0 0 1 18-6M2 16h.01M21.8 16c.2-2 .131-5.354 0-6M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2M8.65 22c.21-.66.45-1.32.57-2M9 6.8a6 6 0 0 1 9 5.2v2',
  pin: 'M6 6h.01M12 6h.01M18 6h.01M6 12h.01M12 12h.01M18 12h.01M6 18h.01M12 18h.01M18 18h.01',
  card: 'M3 6h18v12H3zM3 10h18M7 15h3',
  key: 'M15.5 7.5l2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4M21 2l-9.6 9.6M13 15.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z',
  app: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2',
  check: 'M5 12l5 5L20 7',
  wifi: 'M5 13a10 10 0 0 1 14 0M8.5 16.5a5 5 0 0 1 7 0M2 8.8a15 15 0 0 1 20 0M12 20h.01',
  bluetooth: 'M7 7l10 10-5 5V2l5 5L7 17',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  chat: 'M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 21l2.1-5.7A8.4 8.4 0 1 1 21 11.5z',
  download: 'M12 3v12M7 10l5 5 5-5M5 21h14',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  pinmap: 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
};
export const icon = (name, cls = '') =>
  `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${name === 'pin' ? 2.6 : 1.6}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[name]}"/></svg>`;

/** Kilit gövdesinin şematik ölçü çizimi (1 birim = 1 mm). */
export function bodySvg(b) {
  const d = b.dims;
  const fw = d.faceWidth ?? 22; // alın plakası genişliği
  const fh = d.faceplate ?? d.height + 66;
  const pad = { l: 16, t: 46, r: d.faceplate ? 80 : 62, b: 12 };
  const W = pad.l + fw + d.depth + pad.r;
  const H = pad.t + fh + pad.b;
  const fx = pad.l, fy = pad.t;
  const cx = fx + fw, cy = fy + (fh - d.height) / 2;
  const hx = fx + fw + d.backset; // kol / silindir ekseni
  const hy = cy + d.height * 0.36;
  const ky = hy + d.centres;
  const dim = (x1, y1, x2, y2, label, off = 0, vert = false) => {
    const tx = vert ? x1 + 5 + off : (x1 + x2) / 2;
    const ty = vert ? (y1 + y2) / 2 : y1 - 4;
    return `<g class="dim"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>
      ${vert ? `<line x1="${x1 - 3}" y1="${y1}" x2="${x1 + 3}" y2="${y1}"/><line x1="${x2 - 3}" y1="${y2}" x2="${x2 + 3}" y2="${y2}"/>` : `<line x1="${x1}" y1="${y1 - 3}" x2="${x1}" y2="${y1 + 3}"/><line x1="${x2}" y1="${y2 - 3}" x2="${x2}" y2="${y2 + 3}"/>`}
      <text x="${tx}" y="${ty}" ${vert ? `transform="rotate(90 ${tx} ${ty})" dy="-2"` : ''} text-anchor="middle">${label}</text></g>`;
  };
  return `<svg class="body-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${b.key}">
    <rect class="case" x="${cx}" y="${cy}" width="${d.depth}" height="${d.height}" rx="2"/>
    <rect class="face" x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="${fw / 2 > 6 ? 3 : 2}"/>
    <rect class="bolt" x="${fx - 9}" y="${cy + d.height * 0.12}" width="${fw + 9}" height="16" rx="1.5"/>
    <rect class="bolt" x="${fx - 11}" y="${cy + d.height * 0.7}" width="${fw + 11}" height="22" rx="1.5"/>
    <rect class="hole" x="${hx - 4.5}" y="${hy - 4.5}" width="9" height="9"/>
    <path class="hole" d="M${hx - 5} ${ky - 2}a5 5 0 1 1 10 0c0 1.8-1 3.2-2.4 4.1V${ky + 17}a2.6 2.6 0 0 1-5.2 0V${ky + 2.1}C${hx - 4} ${ky + 1.2} ${hx - 5} ${ky - .2} ${hx - 5} ${ky - 2}z"/>
    <line class="axis" x1="${hx}" y1="${cy - 4}" x2="${hx}" y2="${cy + d.height + 4}"/>
    ${dim(cx, fy - 8, hx, fy - 8, d.backset)}
    ${dim(cx, fy - 26, cx + d.depth, fy - 26, d.depth)}
    ${dim(cx + d.depth + 12, hy, cx + d.depth + 12, ky, d.centres, 0, true)}
    ${dim(cx + d.depth + 32, cy, cx + d.depth + 32, cy + d.height, d.height, 0, true)}
    ${d.faceplate ? dim(cx + d.depth + 52, fy, cx + d.depth + 52, fy + fh, d.faceplate, 0, true) : ''}
  </svg>`;
}
