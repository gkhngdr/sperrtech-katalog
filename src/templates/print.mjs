// PDF kataloğun HTML'i: her <section class="page"> bir A4 sayfadır.
import { site, products, tr, ui, esc, icon, bodySvg, groupOf, publishedSpecs, stat, fontFaces } from '../lib.mjs';
import { logo } from '../logo.mjs';

const IMG = '../assets/images';

export function printHtml(lang, qrSvg, css) {
  const t = tr(lang);
  const u = (k) => ui(lang, k);
  const c = site.company;

  // Sayfa planı: numaralar içindekiler ve altbilgi için önceden hesaplanır.
  const plan = ['cover', 'brand', 'overview', ...products.map((p) => p.code), 'compare', 'bodies', 'install', 'app', 'back'];
  const pageOf = (id) => plan.indexOf(id) + 1;

  const page = (id, cls, kicker, body) => `
<section class="page ${cls}" id="${id}">
  <header class="ph"><span class="ph-logo">${logo()}</span><span class="ph-k">${kicker}</span></header>
  <div class="pb">${body}</div>
  <footer class="pf"><span>${esc(site.brand)} · ${u('catalogTitle')} ${site.year}</span><span>${esc(c.phone[lang])}</span><span class="pn">${String(pageOf(id)).padStart(2, '0')}</span></footer>
</section>`;

  // Halkalar SVG olarak çizilir: CSS degradeleri bazı PDF görüntüleyicilerde bozuk çıkıyor.
  const rings = `<svg class="cv-rings" viewBox="-95 -95 190 190" aria-hidden="true"><g fill="none" stroke="#C8A97E" stroke-opacity=".24" stroke-width=".25">${[1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<circle r="${i * 11.7}"/>`).join('')}</g><circle r="4.5" fill="#C8A97E"/></svg>`;

  const cover = `
<section class="page cover" id="cover">
  <div class="cv-top">
    ${rings}
    <div class="cv-logo">${logo()}</div>
    <h1>${u('catalogTitle').replace(' ', '<br>')}</h1>
    <p class="cv-line">${u('coverLine')}</p>
    <p class="cv-year">${site.year}</p>
  </div>
  <div class="cv-stage">
    ${['AEL38', 'AER22', 'AEJ62'].map((k) => `<img src="${IMG}/${k}-print.jpg" alt="">`).join('')}
  </div>
  <div class="cv-foot"><span lang="tr">${esc(c.short)}</span><span>${esc(c.phone[lang])}</span></div>
</section>`;

  const brand = page('brand', 'brand', u('whyKicker'), `
  <h2 class="h-xl">${u('whyTitle')}</h2>
  <p class="lead">${u('whyLead')}</p>
  <div class="why">${site.why.map((w, i) => `<div><b class="num">${String(i + 1).padStart(2, '0')}</b><h3>${t(w.t)}</h3><p>${t(w.d)}</p></div>`).join('')}</div>
  <div class="facts">
    <div><b>12</b><span>${lang === 'tr' ? 'model' : 'models'}</span></div>
    <div><b>4</b><span>${lang === 'tr' ? 'ürün grubu' : 'product groups'}</span></div>
    <div><b>${Object.keys(site.unlock).length}</b><span>${lang === 'tr' ? 'açma yöntemi' : 'ways to unlock'}</span></div>
    <div><b>2</b><span>${lang === 'tr' ? 'yıl garanti' : 'year warranty'}</span></div>
  </div>
  <div class="grp">${site.groups.map((g) => `<div><h3>${t(g.name)}</h3><p>${t(g.desc)}</p><span>${products.filter((p) => p.group === g.key).map((p) => p.code).join(' · ')}</span></div>`).join('')}</div>
  <div class="methods">${Object.entries(site.unlock).map(([k, v]) => `<span>${icon(k)}${t(v)}</span>`).join('')}</div>`);

  const overview = page('overview', 'overview', u('contents'), `
  <h2 class="h-lg">${u('overview')}</h2>
  <p class="lead sm">${u('overviewLead')}</p>
  ${site.groups.map((g) => `
  <div class="og">
    <h3>${t(g.name)}</h3>
    <div class="og-row">${products.filter((p) => p.group === g.key).map((p) => `
      <a class="oc" href="#${p.code}"><img src="${IMG}/${p.code}-print.jpg" alt=""><b>${p.code}</b><span>${t(p.name)}</span><i>${u('page')} ${pageOf(p.code)}</i></a>`).join('')}
    </div>
  </div>`).join('')}
  <div class="toc">${[['compare', 'compare'], ['bodies', 'bodiesTitle'], ['install', 'installTitle'], ['app', 'appKicker'], ['back', 'contact']].map(([id, k]) => `<a href="#${id}"><span>${u(k)}</span><i>${pageOf(id)}</i></a>`).join('')}</div>`);

  const product = (p) => page(p.code, 'product', t(groupOf(p).name), `
  <div class="pt"><h2>${p.code}</h2><div><h3>${t(p.name)}</h3><p>${t(p.tagline)}</p></div></div>
  <div class="hero">
    <div class="stage"><img src="${IMG}/${p.code}-print.jpg" alt="${t(p.name)}"></div>
    <div class="hl">
      <h4>${u('highlights')}</h4>
      <ul>${p.highlights.map((h) => `<li><b>${t(h.t)}</b>${t(h.d)}</li>`).join('')}</ul>
    </div>
  </div>
  <div class="strip">
    <div class="stats">${p.stats.map((s) => { const x = stat(s, lang); return `<div><b>${esc(x.v)}${x.u ? `<small>${esc(x.u)}</small>` : ''}</b><span>${esc(x.l)}</span></div>`; }).join('')}</div>
    <div class="unl">${p.unlock.map((k) => `<span>${icon(k)}${t(site.unlock[k])}</span>`).join('')}</div>
  </div>
  <h4 class="sec">${u('specs')}</h4>
  <table class="specs">${publishedSpecs(p).map((s) => `<tr><th>${t(site.labels[s.k])}</th><td>${esc(s[lang])}</td></tr>`).join('')}</table>
  ${p.box ? `<div class="box"><h4>${u('box')}</h4><p>${p.box[lang].map(esc).join(' · ')}</p></div>` : ''}`);

  const methods = Object.keys(site.unlock);
  const compare = page('compare', 'compare', u('compare'), `
  <h2 class="h-lg">${u('compare')}</h2>
  <p class="lead sm">${u('compareLead')}</p>
  <table class="cmp">
    <thead><tr><th>${u('model')}</th>${methods.map((m) => `<th class="ci">${icon(m)}<span>${t(site.unlock[m])}</span></th>`).join('')}<th>${u('connection')}</th><th>${u('tempPin')}</th><th>${u('powerCol')}</th><th>${u('protectionCol')}</th><th>${u('bodyCol')}</th></tr></thead>
    <tbody>${site.groups.map((g) => `<tr class="gr"><td colspan="${methods.length + 6}">${t(g.name)}</td></tr>` + products.filter((p) => p.group === g.key).map((p) => `
      <tr><th><a href="#${p.code}">${p.code}</a></th>${methods.map((m) => `<td class="ci">${p.unlock.includes(m) ? icon('check') : ''}</td>`).join('')}
      <td>${t(site.conn[p.conn])}</td><td class="ci">${p.tempPin ? icon('check') : '–'}</td><td>${esc(p.short.power[lang])}</td><td>${p.short.ip || '–'}</td><td>${p.body === 'hotel' ? (lang === 'tr' ? 'Otel tipi' : 'Hotel') : p.body || '–'}</td></tr>`).join('')).join('')}
    </tbody>
  </table>
  <p class="note">${u('disclaimer')}</p>`);

  const bodies = page('bodies', 'bodies', u('bodies'), `
  <h2 class="h-lg">${u('bodiesTitle')}</h2>
  <p class="lead sm">${u('bodiesLead')}</p>
  <div class="bd">${site.bodies.map((b) => `<figure>${bodySvg(b)}<figcaption><b>${t(b.title)}</b><span>${b.models.join(', ')}</span></figcaption></figure>`).join('')}</div>
  <p class="note">${t(site.bodyUse)} ${lang === 'tr' ? 'Çizimler şematiktir.' : 'Drawings are schematic.'}</p>
  <h4 class="sec">${u('whichBody')}</h4>
  <table class="specs">${site.bodyTable.map((r) => `<tr><th>${t(r.body)}</th><td>${lang === 'en' && r.modelsEn ? r.modelsEn : r.models}</td></tr>`).join('')}</table>
  <h4 class="sec">${u('accessories')} <small>${u('accessoriesLead')}</small></h4>
  <table class="specs">${site.accessories.map((a) => `<tr><th>${t(a.t)}</th><td>${t(a.d)}</td></tr>`).join('')}</table>`);

  const install = page('install', 'install', u('install'), `
  <h2 class="h-lg">${u('installTitle')}</h2>
  <p class="lead sm">${u('installLead')}</p>
  <div class="steps">${site.installSteps.map((s, i) => `<div><b class="num">${i + 1}</b><h3>${t(s.t)}</h3><p>${t(s.d)}</p></div>`).join('')}</div>
  <p class="note">${u('installNote')}</p>
  <h4 class="sec">${u('modelNotes')}</h4>
  <table class="notes">${site.modelNotes.map((n) => { const p = products.find((x) => x.code === n.code); return `<tr><th><b>${n.code}</b><span>${t(p.name)}</span></th><td><ol>${n[lang].map((s) => `<li>${esc(s)}</li>`).join('')}</ol></td></tr>`; }).join('')}</table>`);

  const app = page('app', 'app', u('appKicker'), `
  <h2 class="h-lg">${u('appTitle')}</h2>
  <p class="lead sm">${u('appLead')}</p>
  <div class="appimg"><img src="${IMG}/app-print.jpg" alt=""></div>
  <div class="why four">${site.appFeatures.map((w) => `<div><h3>${t(w.t)}</h3><p>${t(w.d)}</p></div>`).join('')}</div>
  <p class="note">${u('appNote')}</p>`);

  const back = `
<section class="page back" id="back">
  ${rings}
  <div class="bk-logo">${logo()}</div>
  <h2>${u('contactTitle')}</h2>
  <p class="bk-lead">${u('contactLead')}</p>
  <div class="bk-grid">
    <div class="bk-list">
      <a href="tel:${c.tel}">${icon('phone')}<span><i>${u('phone')} · WhatsApp</i>${esc(c.phone[lang])}</span></a>
      <a href="mailto:${c.email}">${icon('mail')}<span><i>${u('email')}</i>${c.email}</span></a>
      <div>${icon('pinmap')}<span><i>${u('address')}</i>${t(c.address)}</span></div>
    </div>
    <a class="bk-qr" href="https://wa.me/${c.whatsapp}">${qrSvg}<span>${u('whatsapp')}</span></a>
  </div>
  <div class="bk-foot"><b>${esc(c.legal)}</b><span>${u('disclaimer')}</span></div>
</section>`;

  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><title>${esc(site.brand)} ${u('catalogTitle')} ${site.year}</title>
<style>${fontFaces('../assets/fonts')}\n${css}</style></head>
<body>${cover}${brand}${overview}${products.map(product).join('')}${compare}${bodies}${install}${app}${back}</body></html>`;
}
