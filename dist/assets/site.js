// Sperrtech site etkileşimleri. GSAP yoksa veya kullanıcı "hareketi azalt" seçtiyse
// sayfa animasyonsuz ama tam işlevli çalışır.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  const motion = hasGsap && !reduce;
  document.documentElement.classList.toggle('no-motion', !motion);

  // Üst bar
  const top = $('[data-top]');
  const onScroll = () => top.classList.toggle('scrolled', scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Filtreleme
  const grid = $('[data-grid]');
  if (grid) {
    const cards = $$('[data-card]', grid);
    const state = { group: '', unlock: new Set() };
    const out = $('[data-count-out]');
    const empty = $('[data-empty]');
    const unit = document.documentElement.lang === 'tr' ? 'model' : 'models';
    const apply = () => {
      let n = 0;
      for (const c of cards) {
        const have = c.dataset.unlock.split(' ');
        const ok = (!state.group || c.dataset.group === state.group) && [...state.unlock].every((k) => have.includes(k));
        c.hidden = !ok;
        if (ok) n++;
      }
      out.textContent = `${n} ${unit}`;
      empty.hidden = n > 0;
    };
    const update = () => {
      if (document.startViewTransition && !reduce) document.startViewTransition(apply);
      else apply();
      if (motion) ScrollTrigger.refresh();
    };
    const setGroup = (g) => {
      state.group = g;
      $$('[data-f-group]').forEach((b) => b.classList.toggle('on', b.dataset.fGroup === g));
      update();
    };
    $$('[data-f-group]').forEach((b) => b.addEventListener('click', () => setGroup(b.dataset.fGroup)));
    $$('[data-f-unlock]').forEach((b) =>
      b.addEventListener('click', () => {
        const k = b.dataset.fUnlock;
        const on = !state.unlock.has(k);
        on ? state.unlock.add(k) : state.unlock.delete(k);
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on);
        update();
      }),
    );
    $$('[data-pick]').forEach((a) => a.addEventListener('click', () => setGroup(a.dataset.pick)));
    apply();
  }

  // Kart eğimi ve ışık (yalnızca fare ile)
  if (fine && !reduce) {
    $$('[data-card]').forEach((c) => {
      c.addEventListener('pointermove', (e) => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty('--ry', `${(x - 0.5) * 9}deg`);
        c.style.setProperty('--rx', `${(0.5 - y) * 9}deg`);
        c.style.setProperty('--mx', `${x * 100}%`);
        c.style.setProperty('--my', `${y * 100}%`);
      });
      c.addEventListener('pointerleave', () => { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
    });
  }

  // Özellik noktaları
  $$('[data-hs]').forEach((b) =>
    b.addEventListener('click', () => {
      const open = b.getAttribute('aria-expanded') === 'true';
      $$('[data-hs]').forEach((o) => o.setAttribute('aria-expanded', 'false'));
      b.setAttribute('aria-expanded', String(!open));
    }),
  );

  // Ürün sayfası: etkin özellik adımı (animasyon olmasa da çalışır)
  const steps = $$('[data-step]');
  const stepOut = $('[data-step-out]');
  if (steps.length && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-steps');
    const base = stepOut ? stepOut.textContent : '';
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => {
        e.target.classList.toggle('on', e.isIntersecting);
        const on = steps.filter((s) => s.classList.contains('on'));
        if (stepOut) stepOut.textContent = on.length ? on[on.length - 1].dataset.step : base;
      }),
      { rootMargin: '-38% 0px -38% 0px' },
    );
    steps.forEach((s) => io.observe(s));
  }

  if (!motion) return;
  gsap.registerPlugin(ScrollTrigger);
  const ease = 'power3.out';

  // Açılış: metin sırayla gelir. Ana görsel gizlenmez, yalnızca hafifçe yerine oturur.
  gsap.from('[data-in]', { y: 34, opacity: 0, duration: 0.9, ease, stagger: 0.09, delay: 0.1 });
  if ($('.hero-img')) {
    gsap.from('.hero-img', { y: 40, scale: 0.94, rotate: -3, duration: 1.3, ease });
    gsap.from('.orb', { scale: 0.7, opacity: 0, duration: 1.4, ease });
    gsap.from('.float, .hero-tag', { scale: 0.6, opacity: 0, duration: 0.7, ease: 'back.out(1.8)', stagger: 0.12, delay: 0.7 });
  }
  if ($('[data-stage-img]')) gsap.from('[data-stage-img]', { scale: 0.9, y: 30, duration: 1.2, ease });

  // Açılış görseli: fareye göre katmanlı derinlik
  const par = $('[data-parallax]');
  if (par && fine) {
    const layers = $$('[data-depth]', par).map((el) => ({ x: gsap.quickTo(el, 'x', { duration: 0.8, ease }), y: gsap.quickTo(el, 'y', { duration: 0.8, ease }), d: +el.dataset.depth }));
    $('[data-hero]').addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      layers.forEach((l) => { l.x(nx * l.d); l.y(ny * l.d); });
    });
  }
  if (par) gsap.to(par, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true } });

  // Kaydırmayla beliren bölümler
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%', once: true,
    onEnter: (els) => gsap.fromTo(els, { y: 44, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease, stagger: 0.08, overwrite: true }),
  });
  gsap.set('[data-reveal]', { opacity: 0 });
  ScrollTrigger.batch('[data-card]', {
    start: 'top 92%', once: true,
    onEnter: (els) => gsap.from(els, { y: 50, opacity: 0, duration: 0.8, ease, stagger: 0.07, clearProps: 'opacity,transform' }),
  });

  // Sayaçlar
  $$('[data-count]').forEach((el) => {
    const end = +el.dataset.count, o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.4, ease: 'power2.out', onUpdate: () => (el.textContent = Math.round(o.v)) }) });
  });

  // Uygulama görseli: hafif süzülme
  const fl = $('[data-float]');
  if (fl) gsap.fromTo(fl, { y: 60 }, { y: -20, ease: 'none', scrollTrigger: { trigger: fl, start: 'top bottom', end: 'bottom top', scrub: true } });

  // Ürün sayfası: sabit görsel, her özellik adımında hafifçe yer değiştirir
  const simg = $('[data-stage-img]');
  if (simg && steps.length && matchMedia('(min-width: 981px)').matches) {
    const poses = [{ scale: 1.08, xPercent: 4, yPercent: 4, rotate: -2 }, { scale: 1.12, xPercent: -5, yPercent: 5, rotate: 2 }, { scale: 1.06, xPercent: 3, yPercent: -3, rotate: -1 }, { scale: 1.12, xPercent: -4, yPercent: -5, rotate: 1.5 }, { scale: 1.04, xPercent: 0, yPercent: 0, rotate: 0 }];
    steps.forEach((s, i) => {
      ScrollTrigger.create({
        trigger: s, start: 'top 60%', end: 'bottom 40%',
        onToggle: (self) => self.isActive && gsap.to(simg, { ...poses[i % poses.length], duration: 1.1, ease: 'power2.out', overwrite: 'auto' }),
      });
    });
    ScrollTrigger.create({ trigger: '.pp-specs', start: 'top 70%', onEnter: () => gsap.to(simg, { scale: 1, xPercent: 0, yPercent: 0, rotate: 0, duration: 1.1, ease: 'power2.out', overwrite: 'auto' }), onLeaveBack: () => {} });
    ScrollTrigger.create({ trigger: '.pp-intro', start: 'top top', end: 'bottom 60%', onEnterBack: () => gsap.to(simg, { scale: 1, xPercent: 0, yPercent: 0, rotate: 0, duration: 1.1, ease: 'power2.out', overwrite: 'auto' }) });
  }
})();
