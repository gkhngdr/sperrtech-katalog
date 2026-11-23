// Statik site: her dil için ana sayfa ve 12 ürün sayfası. Tüm bağlantılar görelidir,
// bu yüzden dist/index.html çift tıklanarak da açılır.
import sharp from 'sharp';
import { site, products, LANGS, tr, ui, esc, icon, groupOf, publishedSpecs, stat, waLink, fontFaces } from '../lib.mjs';
import { logo } from '../logo.mjs';

const PRODUCT_DIR = { tr: 'urun', en: 'product' };
const pdfName = (lang) => `${site.brand}-Katalog-${site.year}-${lang.toUpperCase()}.pdf`;

export async function buildSite({ out, css }) {
  const dims = {};
  for (const p of products) {
    const m = await sharp(`assets/images/${p.code}.webp`).metadata();
    dims[p.code] = { w: m.width, h: m.height };
  }
  const img = (root, p, cls = '', extra = '') =>
    `<img class="${cls}" src="${root}/assets/images/${p.code}.webp" width="${dims[p.code].w}" height="${dims[p.code].h}" alt="${esc(p.code)}" ${extra}>`;

  const shell = (lang, { root, title, desc, alt, body, page }) => {
    const u = (k) => ui(lang, k);
    const other = lang === 'tr' ? 'en' : 'tr';
    const home = `${root}/${lang}/index.html`;
    return `<!doctype html>
<html lang="${lang}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><meta name="description" content="${desc}">
<link rel="alternate" hreflang="${lang}" href="${alt[lang]}"><link rel="alternate" hreflang="${other}" href="${alt[other]}">
<meta name="theme-color" content="#0E1012">
<style>${fontFaces(`${root}/assets/fonts`)}</style>
<link rel="stylesheet" href="${root}/assets/site.css">
</head>
<body class="${page}">
<header class="top" data-top>
  <a class="brand" href="${home}" aria-label="Sperrtech">${logo()}</a>
  <nav>
    <a href="${home}#urunler">${u('products')}</a>
    <a href="${home}#karsilastirma">${u('compare')}</a>
    <a href="${home}#uygulama">${u('appKicker')}</a>
    <a href="${home}#iletisim">${u('contact')}</a>
  </nav>
  <div class="top-r">
    <a class="lang" href="${alt[other]}" hreflang="${other}" lang="${other}">${other.toUpperCase()}</a>
    <a class="btn sm" href="${waLink(lang)}" target="_blank" rel="noopener">${u('quote')}</a>
  </div>
</header>
${body}
<footer class="foot">
  <div class="foot-in">
    <div><span class="foot-logo">${logo()}</span><p>${esc(site.company.legal)}</p></div>
    <p class="foot-note">${u('disclaimer')}</p>
    <p class="foot-c">© ${site.year} ${esc(site.brand)}</p>
  </div>
</footer>
<script src="${root}/assets/vendor/gsap.min.js"></script>
<script src="${root}/assets/vendor/ScrollTrigger.min.js"></script>
<script src="${root}/assets/site.js"></script>
</body></html>`;
  };

  const chips = (lang, p) => p.unlock.map((k) => `<span class="chip">${icon(k)}${tr(lang)(site.unlock[k])}</span>`).join('');

  // ---------- Ana sayfa ----------
  const index = (lang) => {
    const t = tr(lang);
    const u = (k) => ui(lang, k);
    const root = '..';
    const c = site.company;
    const href = (p) => `${PRODUCT_DIR[lang]}/${p.code}.html`;
    const hero = products.find((p) => p.code === 'AER22');
    const methods = Object.keys(site.unlock);

    const card = (p) => `
<a class="card" href="${href(p)}" data-card data-group="${p.group}" data-unlock="${p.unlock.join(' ')}" style="view-transition-name:c-${p.code}">
  <div class="card-stage">${img(root, p, '', `loading="lazy" style="view-transition-name:p-${p.code}"`)}<i class="glare"></i></div>
  <div class="card-b">
    <div class="card-h"><b>${p.code}</b><span>${t(groupOf(p).short)}</span></div>
    <h3>${t(p.name)}</h3>
    <div class="card-i">${p.unlock.map((k) => `<span title="${t(site.unlock[k])}">${icon(k)}</span>`).join('')}<em>${u('details')} ${icon('arrow')}</em></div>
  </div>
</a>`;

    const body = `
<main>
<section class="hero" data-hero>
  <div class="hero-t">
    <p class="kicker" data-in>${u('catalogTitle')} ${site.year}</p>
    <h1 data-in>${u('heroTitle')}</h1>
    <p class="hero-p" data-in>${u('heroText')}</p>
    <div class="hero-a" data-in>
      <a class="btn" href="#urunler">${u('allProducts')} ${icon('arrow')}</a>
      <a class="btn ghost" href="${root}/${pdfName(lang)}" download>${icon('download')} ${u('downloadPdf')}</a>
    </div>
  </div>
  <a class="hero-v" href="${href(hero)}" data-parallax aria-label="${hero.code}">
    <div class="orb" data-depth="8"><i></i></div>
    ${img(root, hero, 'hero-img', 'fetchpriority="high" data-depth="-14"')}
    <span class="float f1" data-depth="26">${icon('face')}${t(site.unlock.face)}</span>
    <span class="float f2" data-depth="-30">${icon('fingerprint')}${t(site.unlock.fingerprint)}</span>
    <span class="float f3" data-depth="20">${icon('wifi')}Wi-Fi</span>
    <span class="hero-tag" data-depth="12"><b>${hero.code}</b>${t(hero.name)}</span>
  </a>
  <div class="scroll-hint" aria-hidden="true"><i></i>${u('scroll')}</div>
</section>

<section class="ticker" aria-hidden="true"><div class="ticker-in">${[0, 1].map(() => methods.map((k) => `<span>${icon(k)}${t(site.unlock[k])}</span>`).join('') + `<span>${icon('wifi')}Wi-Fi</span><span>${icon('bluetooth')}Bluetooth</span>`).join('')}</div></section>

<section class="sec groups">
  <div class="sec-h" data-reveal><p class="kicker">${u('overview')}</p><h2>${lang === 'tr' ? 'Dört grup, 12 model.' : 'Four groups, twelve models.'}</h2></div>
  <div class="g-grid">${site.groups.map((g, i) => {
    const ps = products.filter((p) => p.group === g.key);
    return `<a class="g-card" href="#urunler" data-pick="${g.key}" data-reveal>
      <b class="num">${String(i + 1).padStart(2, '0')}</b>
      <div class="g-img">${img(root, ps[0], '', 'loading="lazy"')}</div>
      <h3>${t(g.name)}</h3><p>${t(g.desc)}</p>
      <span class="codes">${ps.map((p) => p.code).join(' · ')}</span></a>`;
  }).join('')}</div>
</section>

<section class="sec" id="urunler">
  <div class="sec-h" data-reveal><p class="kicker">${u('products')}</p><h2>${lang === 'tr' ? 'Kapınıza uyan modeli bulun.' : 'Find the model that fits your door.'}</h2></div>
  <div class="filters" data-reveal>
    <div class="f-row" role="group" aria-label="${u('filterGroup')}"><button class="fc on" data-f-group="">${u('all')}</button>${site.groups.map((g) => `<button class="fc" data-f-group="${g.key}">${t(g.short)}</button>`).join('')}</div>
    <div class="f-row" role="group" aria-label="${u('filterUnlock')}">${methods.map((k) => `<button class="fc ic-fc" data-f-unlock="${k}" aria-pressed="false">${icon(k)}${t(site.unlock[k])}</button>`).join('')}<span class="f-count" data-count-out aria-live="polite"></span></div>
  </div>
  <div class="grid" data-grid>${products.map(card).join('')}</div>
  <p class="empty" data-empty hidden>${u('noResult')}</p>
</section>

<section class="sec stats-sec">
  <div class="big-stats">
    <div data-reveal><b data-count="12">12</b><span>${lang === 'tr' ? 'model' : 'models'}</span></div>
    <div data-reveal><b data-count="${methods.length}">${methods.length}</b><span>${lang === 'tr' ? 'açma yöntemi' : 'ways to unlock'}</span></div>
    <div data-reveal><b>IP<i data-count="68">68</i></b><span>${lang === 'tr' ? 'değerine kadar koruma' : 'protection, up to'}</span></div>
    <div data-reveal><b data-count="2">2</b><span>${lang === 'tr' ? 'yıl garanti' : 'year warranty'}</span></div>
  </div>
</section>

<section class="sec" id="karsilastirma">
  <div class="sec-h" data-reveal><p class="kicker">${u('compare')}</p><h2>${lang === 'tr' ? 'Yan yana karşılaştırın.' : 'Compare side by side.'}</h2><p>${u('compareLead')}</p></div>
  <div class="cmp-wrap" data-reveal><table class="cmp">
    <thead><tr><th>${u('model')}</th>${methods.map((m) => `<th class="ci" title="${t(site.unlock[m])}">${icon(m)}<span>${t(site.unlock[m])}</span></th>`).join('')}<th>${u('connection')}</th><th>${u('powerCol')}</th><th>${u('protectionCol')}</th><th>${u('bodyCol')}</th></tr></thead>
    <tbody>${products.map((p) => `<tr><th><a href="${href(p)}"><b>${p.code}</b><span>${t(p.name)}</span></a></th>${methods.map((m) => `<td class="ci">${p.unlock.includes(m) ? icon('check') : '<i>·</i>'}</td>`).join('')}<td>${t(site.conn[p.conn])}</td><td>${esc(p.short.power[lang])}</td><td>${p.short.ip || '–'}</td><td>${p.body === 'hotel' ? (lang === 'tr' ? 'Otel tipi' : 'Hotel') : p.body || '–'}</td></tr>`).join('')}</tbody>
  </table></div>
</section>

<section class="sec app" id="uygulama">
  <div class="app-t">
    <div class="sec-h" data-reveal><p class="kicker">${u('appKicker')}</p><h2>${u('appTitle')}</h2><p>${u('appLead')}</p></div>
    <ul class="feat">${site.appFeatures.map((f) => `<li data-reveal><h3>${t(f.t)}</h3><p>${t(f.d)}</p></li>`).join('')}</ul>
  </div>
  <div class="app-v" data-reveal><img src="${root}/assets/images/app.webp" alt="" loading="lazy" data-float></div>
  <p class="fine">${u('appNote')}</p>
</section>

<section class="sec why">
  <div class="sec-h" data-reveal><p class="kicker">${u('whyKicker')}</p><h2>${u('whyTitle')}</h2><p>${u('whyLead')}</p></div>
  <div class="why-g">${site.why.map((w, i) => `<div data-reveal><b class="num">${String(i + 1).padStart(2, '0')}</b><h3>${t(w.t)}</h3><p>${t(w.d)}</p></div>`).join('')}</div>
</section>

<section class="sec contact" id="iletisim">
  <div class="contact-in" data-reveal>
    <div><p class="kicker">${u('contact')}</p><h2>${u('contactTitle')}</h2><p>${u('contactLead')}</p>
      <div class="hero-a"><a class="btn" href="${waLink(lang)}" target="_blank" rel="noopener">${icon('chat')} ${u('whatsapp')}</a><a class="btn ghost" href="${root}/${pdfName(lang)}" download>${icon('download')} ${u('downloadPdf')}</a></div>
    </div>
    <ul class="c-list">
      <li>${icon('phone')}<span><i>${u('phone')}</i><a href="tel:${c.tel}">${esc(c.phone[lang])}</a></span></li>
      <li>${icon('mail')}<span><i>${u('email')}</i><a href="mailto:${c.email}">${c.email}</a></span></li>
      <li>${icon('pinmap')}<span><i>${u('address')}</i>${t(c.address)}</span></li>
    </ul>
  </div>
</section>
</main>`;
    return shell(lang, {
      root, page: 'home', body,
      title: `${esc(site.brand)} · ${u('catalogTitle')} ${site.year}`,
      desc: u('heroText'),
      alt: { tr: `${root}/tr/index.html`, en: `${root}/en/index.html` },
    });
  };

  // ---------- Ürün sayfası ----------
  const productPage = (lang, p, i) => {
    const t = tr(lang);
    const u = (k) => ui(lang, k);
    const root = '../..';
    const next = products[(i + 1) % products.length];
    const g = groupOf(p);
    const body = `
<main class="pp">
  <div class="pp-grid">
    <aside class="pp-stage" data-stage>
      <div class="stage-in">
        <div class="hs-wrap" style="--r:calc(${dims[p.code].w}/${dims[p.code].h})" data-stage-img>
          ${img(root, p, 'pp-img', `fetchpriority="high" style="view-transition-name:p-${p.code}"`)}
          ${(p.hotspots || []).map((h, n) => `<button class="hs${h.x > 55 ? ' l' : ''}" style="left:${h.x}%;top:${h.y}%" aria-expanded="false" data-hs><span>${n + 1}</span><em>${t(h)}</em></button>`).join('')}
        </div>
      </div>
      <div class="stage-f"><span>${p.code}</span><span data-step-out>${t(g.short)}</span></div>
    </aside>
    <div class="pp-c">
      <section class="pp-intro">
        <a class="crumb" href="../index.html#urunler">${icon('arrow', 'flip')} ${u('back')}</a>
        <p class="kicker" data-in>${t(g.name)}</p>
        <h1 data-in><b>${p.code}</b>${t(p.name)}</h1>
        <p class="hero-p" data-in>${t(p.tagline)}</p>
        <div class="chips" data-in>${chips(lang, p)}</div>
        <div class="p-stats" data-in>${p.stats.map((s) => { const x = stat(s, lang); return `<div><b>${esc(x.v)}${x.u ? `<small>${esc(x.u)}</small>` : ''}</b><span>${esc(x.l)}</span></div>`; }).join('')}</div>
        <div class="hero-a" data-in>
          <a class="btn" href="${waLink(lang, p.code)}" target="_blank" rel="noopener">${icon('chat')} ${u('quote')}</a>
          <a class="btn ghost" href="${root}/${pdfName(lang)}" download>${icon('download')} PDF</a>
        </div>
      </section>
      <section class="pp-hl">
        <p class="kicker">${u('highlights')}</p>
        ${p.highlights.map((h, n) => `<article class="step" data-step="${t(h.t)}"><b class="num">${String(n + 1).padStart(2, '0')}</b><h2>${t(h.t)}</h2><p>${t(h.d)}</p></article>`).join('')}
      </section>
      <section class="pp-specs" data-reveal>
        <p class="kicker">${u('specs')}</p>
        <table class="specs">${publishedSpecs(p).map((s) => `<tr><th>${t(site.labels[s.k])}</th><td>${esc(s[lang])}</td></tr>`).join('')}</table>
      </section>
      <section class="pp-box" data-reveal>
        ${p.box ? `<p class="kicker">${u('box')}</p>
        <ul>${p.box[lang].map((b) => `<li>${icon('check')}${esc(b)}</li>`).join('')}</ul>` : ''}
        ${p.colors ? `<p class="kicker">${u('colors')}</p><div class="chips">${p.colors[lang].map((c) => `<span class="chip">${esc(c)}</span>`).join('')}</div>` : ''}
        <p class="fine">${u('disclaimer')}</p>
      </section>
    </div>
  </div>
  <a class="next" href="${next.code}.html">
    <span><i>${u('next')}</i><b>${next.code}</b>${t(next.name)}</span>
    ${img(root, next, '', 'loading="lazy"')}
    ${icon('arrow')}
  </a>
</main>`;
    return shell(lang, {
      root, page: 'product', body,
      title: `${p.code} ${t(p.name)} · ${esc(site.brand)}`,
      desc: t(p.tagline),
      alt: { tr: `${root}/tr/${PRODUCT_DIR.tr}/${p.code}.html`, en: `${root}/en/${PRODUCT_DIR.en}/${p.code}.html` },
    });
  };

  for (const lang of LANGS) {
    out(`${lang}/index.html`, index(lang));
    products.forEach((p, i) => out(`${lang}/${PRODUCT_DIR[lang]}/${p.code}.html`, productPage(lang, p, i)));
  }
  out('index.html', `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=tr/index.html"><title>Sperrtech</title></head><body><a href="tr/index.html">Türkçe</a> · <a href="en/index.html">English</a></body></html>`);
  out('assets/site.css', css('site.css'));
}
