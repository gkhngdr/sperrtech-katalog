// Sperrtech AER22 Instagram reklamı. 15 sn, sessiz izlenecek şekilde tasarlandı:
// tüm mesaj ekrandaki yazıyla verilir. Yazılar Reels güvenli alanında durur
// (üst %14 ve alt %35 Instagram arayüzüyle kapanır).
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame, interpolate, spring, Easing, delayRender, continueRender } from 'remotion';

export const FPS = 30;
export const DURATION = 450;
const W = 1080, H = 1920;
const SAFE_TOP = 280, SAFE_BOTTOM = 1240, SIDE = 76;
const C = { bg: '#0E1012', ink: '#14171A', text: '#EDEAE4', mute: '#A6ABB1', acc: '#C8A97E', stage1: '#F4F1EA', stage2: '#CFC7B8' };
const HEAD = "'Space Grotesk', sans-serif", BODY = "'IBM Plex Sans', sans-serif", MONO = "'IBM Plex Mono', monospace";

// Sahne sınırları (kare)
const T = { hook: 0, hero: 60, f1: 120, f2: 186, f3: 252, methods: 318, end: 366 };

const TEXT = {
  tr: {
    hook1: 'Anahtarı unutun.', hook2: 'Kapınız sizi tanısın.',
    name: 'Görüntülü yüz tanımalı akıllı kilit',
    f: [
      ['3D yüz tanıma', 'Kapıya dokunmadan girin. Bakmanız yeterli.', 'Tanındı'],
      ['Ekran ve kamera', 'Kapıyı açmadan kimin geldiğini görün.', '4,5″ ekran · 2 MP'],
      ['Tam otomatik kilit', 'Kapı kapanır, sürgü kendiliğinden atar.', 'Kilitlendi'],
    ],
    methodsT: ['6', 'açma yöntemi'],
    methods: ['Yüz', 'Parmak izi', 'Şifre', 'Kart', 'Anahtar', 'Uygulama'],
    tag: 'Her kapıya uygun akıllı kilit.', cta: 'Teklif için yazın', phone: '0538 799 42 70', by: 'Özgür Yapı Alüminyum · Trabzon',
  },
  en: {
    hook1: 'Forget the key.', hook2: 'Let your door know you.',
    name: 'Face recognition smart lock with video',
    f: [
      ['3D face recognition', 'Walk in without touching the door.', 'Recognised'],
      ['Screen and camera', 'See who is there before you open.', '4.5″ screen · 2 MP'],
      ['Fully automatic locking', 'The door closes and the bolts throw.', 'Locked'],
    ],
    methodsT: ['6', 'ways to unlock'],
    methods: ['Face', 'Fingerprint', 'PIN', 'Card', 'Key', 'App'],
    tag: 'A smart lock for every door.', cta: 'Message us for a quote', phone: '+90 538 799 42 70', by: 'Özgür Yapı Alüminyum · Trabzon',
  },
};

const ICONS = {
  face: 'M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M9 10v1M15 10v1M9.5 15a3.5 3.5 0 0 0 5 0',
  fingerprint: 'M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4M14 13.12c0 2.38 0 6.38-1 8.88M17.29 21.02c.12-.6.43-2.3.5-3.02M2 12a10 10 0 0 1 18-6M2 16h.01M21.8 16c.2-2 .131-5.354 0-6M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2M8.65 22c.21-.66.45-1.32.57-2M9 6.8a6 6 0 0 1 9 5.2v2',
  pin: 'M6 6h.01M12 6h.01M18 6h.01M6 12h.01M12 12h.01M18 12h.01M6 18h.01M12 18h.01M18 18h.01',
  card: 'M3 6h18v12H3zM3 10h18M7 15h3',
  key: 'M15.5 7.5l2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4M21 2l-9.6 9.6M13 15.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z',
  app: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2',
  check: 'M5 12l5 5L20 7',
  lock: 'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3',
  chat: 'M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 21l2.1-5.7A8.4 8.4 0 1 1 21 11.5z',
};
const Icon = ({ name, size = 48, color = 'currentColor', sw }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw ?? (name === 'pin' ? 2.6 : 1.6)} strokeLinecap="round" strokeLinejoin="round">
    <path d={ICONS[name]} />
  </svg>
);

// Yazı tipleri (Türkçe harfler latin-ext dosyasında)
const FONTS = [['Space Grotesk', 'space-grotesk', [500, 600]], ['IBM Plex Sans', 'ibm-plex-sans', [400, 500]], ['IBM Plex Mono', 'ibm-plex-mono', [500]]];
const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const faces = FONTS.flatMap(([fam, file, ws]) =>
      ws.flatMap((w) => [
        new FontFace(fam, `url(${staticFile(`fonts/${file}-latin-${w}-normal.woff2`)})`, { weight: String(w), unicodeRange: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2212' }),
        new FontFace(fam, `url(${staticFile(`fonts/${file}-latin-ext-${w}-normal.woff2`)})`, { weight: String(w), unicodeRange: 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1E00-1EFF' }),
      ]),
    );
    Promise.all(faces.map((f) => f.load().then((l) => document.fonts.add(l)))).then(() => continueRender(handle));
  }, [handle]);
};

const ease = Easing.bezier(0.2, 0.7, 0.2, 1);
const io = Easing.inOut(Easing.cubic);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };
/** Giriş: aşağıdan kayarak belirir; çıkış: solarak kaybolur. */
const inOut = (f, start, end, d = 14) => ({
  opacity: interpolate(f, [start, start + d, end - 8, end], [0, 1, 1, 0], clamp),
  y: interpolate(f, [start, start + d], [46, 0], { ...clamp, easing: ease }),
});

// Ürün "kamerası": [kare, ölçek, görseldeki odak x, odak y, ekranda hedef x, hedef y]
const PW = 558, PH = 1050; // ölçek 1'de ürün boyutu
const CAM = [
  [0, 0.9, 0.5, 0.5, 540, 1720],
  [24, 0.9, 0.5, 0.5, 540, 1600],
  [T.hero - 22, 0.92, 0.5, 0.5, 540, 1570],
  [T.hero + 34, 1.04, 0.5, 0.5, 540, 1270],
  [T.f1 - 8, 1.1, 0.5, 0.5, 540, 1270],
  [T.f1 + 22, 1.55, 0.28, 0.16, 540, 1050],
  [T.f2 - 6, 1.6, 0.28, 0.16, 540, 1050],
  [T.f2 + 22, 1.55, 0.72, 0.18, 540, 1050],
  [T.f3 - 6, 1.6, 0.72, 0.18, 540, 1050],
  [T.f3 + 22, 1.3, 0.55, 0.72, 540, 1120],
  [T.methods - 6, 1.34, 0.55, 0.72, 540, 1120],
  [T.methods + 24, 0.8, 0.5, 0.5, 540, 1420],
  [T.end - 4, 0.8, 0.5, 0.5, 540, 1420],
  [T.end + 26, 0.7, 0.5, 0.5, 540, 1590],
  [DURATION, 0.74, 0.5, 0.5, 540, 1590],
];
const cam = (f) => {
  const fr = CAM.map((k) => k[0]);
  const v = (i) => interpolate(f, fr, CAM.map((k) => k[i]), { ...clamp, easing: io });
  const s = v(1), fx = v(2), fy = v(3), tx = v(4), ty = v(5);
  const w = PW * s, h = PH * s;
  const left = tx - fx * w, top = ty - fy * h;
  return { s, w, h, left, top, cx: left + w / 2, cy: top + h / 2, at: (x, y) => ({ x: left + x * w, y: top + y * h }) };
};

const Stage = ({ f }) => {
  const c = cam(f);
  const d = Math.max(c.h * 1.04, 760);
  const pulse = (f % 90) / 90;
  const dim = interpolate(f, [T.end, T.end + 26], [1, 0.42], clamp);
  return (
    <AbsoluteFill style={{ opacity: dim }}>
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        {[0, 1, 2, 3].map((i) => {
          const r = d / 2 + 70 + i * 120 + pulse * 120;
          return <circle key={i} cx={c.cx} cy={c.cy} r={r} fill="none" stroke={C.acc} strokeWidth={2} opacity={0.3 * (1 - (i + pulse) / 4)} />;
        })}
      </svg>
      <div style={{ position: 'absolute', left: c.cx - d / 2, top: c.cy - d / 2, width: d, height: d, borderRadius: '50%', background: `radial-gradient(circle at 38% 30%, #fff 0, ${C.stage1} 30%, ${C.stage2} 74%, #b3ab9b 100%)`, boxShadow: '0 0 160px rgba(200,169,126,.28)' }} />
      <Img src={staticFile('aer22.png')} style={{ position: 'absolute', left: c.left, top: c.top, width: c.w, height: c.h, filter: 'drop-shadow(0 40px 36px rgba(10,11,12,.5))', transform: `rotate(${interpolate(f, [0, T.hero + 34, DURATION], [-5, 0, 1.5], clamp)}deg)` }} />
    </AbsoluteFill>
  );
};

// Üstte yazının okunması için koyu geçiş
const TopShade = () => <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${C.bg} 0, ${C.bg} 24%, rgba(14,16,18,.8) 31%, rgba(14,16,18,0) 43%)` }} />;

const Chip = ({ children, x, y, f, start, icon }) => {
  const s = spring({ frame: f - start, fps: FPS, config: { damping: 13, stiffness: 150 } });
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, display: 'flex', alignItems: 'center', gap: 14, background: C.ink, color: C.text, border: `2px solid ${C.acc}`, borderRadius: 999, padding: '16px 30px 16px 22px', font: `600 36px ${HEAD}`, whiteSpace: 'nowrap', boxShadow: '0 20px 50px rgba(0,0,0,.55)' }}>
      <span style={{ display: 'grid', placeItems: 'center', width: 46, height: 46, borderRadius: '50%', background: C.acc }}><Icon name={icon} size={28} color={C.ink} sw={2.6} /></span>
      {children}
    </div>
  );
};

const Hook = ({ t }) => {
  const f = useCurrentFrame();
  // İlk kare Instagram kapağı olur: ilk satır ve ürün 0. karede görünür.
  const a = inOut(f, -14, T.hero + 4, 12), b = inOut(f, 16, T.hero + 4, 12);
  return (
    <AbsoluteFill style={{ padding: `${SAFE_TOP + 150}px ${SIDE}px 0` }}>
      <div style={{ font: `600 112px/1.04 ${HEAD}`, letterSpacing: '-0.03em', color: C.text, opacity: a.opacity, transform: `translateY(${a.y}px)` }}>{t.hook1}</div>
      <div style={{ font: `600 112px/1.04 ${HEAD}`, letterSpacing: '-0.03em', color: C.acc, marginTop: 22, opacity: b.opacity, transform: `translateY(${b.y}px)` }}>{t.hook2}</div>
    </AbsoluteFill>
  );
};

const Hero = ({ t }) => {
  const f = useCurrentFrame();
  const len = T.f1 - T.hero;
  const a = inOut(f, 8, len, 14), b = inOut(f, 20, len, 14);
  return (
    <AbsoluteFill style={{ padding: `${SAFE_TOP}px ${SIDE}px 0`, textAlign: 'center' }}>
      <div style={{ font: `500 210px/1 ${MONO}`, letterSpacing: '-0.06em', color: C.acc, opacity: a.opacity, transform: `translateY(${a.y}px)` }}>AER22</div>
      <div style={{ font: `500 46px/1.25 ${HEAD}`, color: C.text, marginTop: 18, opacity: b.opacity, transform: `translateY(${b.y}px)` }}>{t.name}</div>
    </AbsoluteFill>
  );
};

const Feature = ({ t, n, len }) => {
  const f = useCurrentFrame();
  const [title, sub] = t.f[n];
  const a = inOut(f, 2, len, 10), b = inOut(f, 5, len, 10), k = inOut(f, 0, len, 10);
  return (
    <AbsoluteFill style={{ padding: `${SAFE_TOP}px ${SIDE}px 0` }}>
      <div style={{ font: `500 30px ${MONO}`, color: C.acc, opacity: k.opacity, letterSpacing: '.08em' }}>0{n + 1} / 03</div>
      <div style={{ font: `600 98px/1.04 ${HEAD}`, letterSpacing: '-0.03em', color: C.text, marginTop: 20, opacity: a.opacity, transform: `translateY(${a.y}px)` }}>{title}</div>
      <div style={{ font: `400 44px/1.3 ${BODY}`, color: C.mute, marginTop: 22, maxWidth: 860, opacity: b.opacity, transform: `translateY(${b.y}px)` }}>{sub}</div>
    </AbsoluteFill>
  );
};

// Özellik sahnelerinde ürün üzerindeki işaretler (genel kare numarasıyla çalışır)
const Overlays = ({ f, t }) => {
  const c = cam(f);
  const out = [];
  if (f >= T.f1 + 14 && f < T.f2) {
    const p = c.at(0.24, 0.115), size = 250, lf = f - T.f1 - 14;
    const o = interpolate(f, [T.f1 + 14, T.f1 + 22, T.f2 - 8, T.f2], [0, 1, 1, 0], clamp);
    const scan = interpolate(lf % 26, [0, 26], [-size / 2, size / 2]);
    const corner = (dx, dy) => ({ position: 'absolute', left: p.x + (dx * size) / 2 - (dx > 0 ? 54 : 0), top: p.y + (dy * size) / 2 - (dy > 0 ? 54 : 0), width: 54, height: 54, borderColor: C.acc, borderStyle: 'solid', borderWidth: `${dy < 0 ? 6 : 0}px ${dx > 0 ? 6 : 0}px ${dy > 0 ? 6 : 0}px ${dx < 0 ? 6 : 0}px`, borderRadius: 6 });
    out.push(
      <div key="scan" style={{ opacity: o }}>
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, y]) => <div key={`${x}${y}`} style={corner(x, y)} />)}
        {lf < 30 && <div style={{ position: 'absolute', left: p.x - size / 2 + 12, top: p.y + scan, width: size - 24, height: 5, background: C.acc, boxShadow: `0 0 26px 6px ${C.acc}`, borderRadius: 3 }} />}
        <Chip x={p.x + 250} y={p.y + 210} f={f} start={T.f1 + 34} icon="check">{t.f[0][2]}</Chip>
      </div>,
    );
  }
  if (f >= T.f2 + 14 && f < T.f3) {
    const a = c.at(0.585, 0.02), b = c.at(0.875, 0.285);
    const o = interpolate(f, [T.f2 + 14, T.f2 + 22, T.f3 - 8, T.f3], [0, 1, 1, 0], clamp);
    const glow = 0.5 + 0.5 * Math.sin((f - T.f2) / 4);
    out.push(
      <div key="screen" style={{ opacity: o }}>
        <div style={{ position: 'absolute', left: a.x, top: a.y, width: b.x - a.x, height: b.y - a.y, border: `6px solid ${C.acc}`, borderRadius: 26, boxShadow: `0 0 ${30 + glow * 40}px ${C.acc}` }} />
        <Chip x={(a.x + b.x) / 2 - 170} y={b.y + 70} f={f} start={T.f2 + 26} icon="check">{t.f[1][2]}</Chip>
      </div>,
    );
  }
  if (f >= T.f3 + 14 && f < T.methods) {
    const p = c.at(0.77, 0.81);
    const o = interpolate(f, [T.f3 + 14, T.f3 + 22, T.methods - 8, T.methods], [0, 1, 1, 0], clamp);
    const r = interpolate((f - T.f3) % 30, [0, 30], [50, 150]);
    out.push(
      <div key="lock" style={{ opacity: o }}>
        <div style={{ position: 'absolute', left: p.x - r, top: p.y - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `5px solid ${C.acc}`, opacity: 1 - (r - 50) / 100 }} />
        <Chip x={p.x - 200} y={p.y + 130} f={f} start={T.f3 + 24} icon="lock">{t.f[2][2]}</Chip>
      </div>,
    );
  }
  return <>{out}</>;
};

const Methods = ({ t }) => {
  const f = useCurrentFrame();
  const len = T.end - T.methods;
  const a = inOut(f, 2, len, 12);
  const keys = ['face', 'fingerprint', 'pin', 'card', 'key', 'app'];
  return (
    <AbsoluteFill style={{ padding: `${SAFE_TOP}px ${SIDE}px 0` }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 26, opacity: a.opacity, transform: `translateY(${a.y}px)` }}>
        <span style={{ font: `600 230px/0.9 ${HEAD}`, color: C.acc, letterSpacing: '-0.05em' }}>{t.methodsT[0]}</span>
        <span style={{ font: `600 84px/1 ${HEAD}`, color: C.text, letterSpacing: '-0.03em' }}>{t.methodsT[1]}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 44 }}>
        {keys.map((k, i) => {
          const s = spring({ frame: f - 8 - i * 3, fps: FPS, config: { damping: 14, stiffness: 170 } });
          const o = interpolate(f, [len - 8, len], [1, 0], clamp);
          return (
            <div key={k} style={{ transform: `scale(${s})`, opacity: o, background: 'rgba(21,24,27,.92)', border: '2px solid #30353b', borderRadius: 28, padding: '30px 10px 26px', display: 'grid', justifyItems: 'center', gap: 14, color: C.text, font: `500 34px ${HEAD}` }}>
              <Icon name={k} size={76} color={C.acc} />
              {t.methods[i]}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const End = ({ t }) => {
  const f = useCurrentFrame();
  const up = (d) => ({ opacity: interpolate(f, [d, d + 14], [0, 1], clamp), transform: `translateY(${interpolate(f, [d, d + 14], [44, 0], { ...clamp, easing: ease })}px)` });
  const cta = spring({ frame: f - 26, fps: FPS, config: { damping: 12, stiffness: 140 } });
  return (
    <AbsoluteFill style={{ padding: `${SAFE_TOP + 70}px ${SIDE}px 0`, textAlign: 'center', alignItems: 'center' }}>
      <div style={{ font: `600 96px ${HEAD}`, letterSpacing: '.2em', color: C.text, marginRight: '-.2em', ...up(4) }}>SPERRTECH</div>
      <div style={{ width: interpolate(f, [10, 34], [0, 220], { ...clamp, easing: ease }), height: 5, background: C.acc, borderRadius: 3, margin: '34px 0 38px' }} />
      <div style={{ font: `500 58px/1.2 ${HEAD}`, color: C.text, maxWidth: 800, ...up(12) }}>{t.tag}</div>
      <div style={{ marginTop: 78, transform: `scale(${cta})`, background: C.acc, color: C.ink, borderRadius: 40, padding: '34px 56px 38px', boxShadow: '0 30px 80px rgba(200,169,126,.35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, font: `600 38px ${HEAD}` }}><Icon name="chat" size={42} sw={2} />{t.cta}</div>
        <div style={{ font: `500 76px/1.1 ${MONO}`, letterSpacing: '-0.04em', marginTop: 10, whiteSpace: 'nowrap' }}>{t.phone}</div>
      </div>
      <div style={{ font: `500 32px ${HEAD}`, color: C.mute, marginTop: 44, letterSpacing: '.04em', ...up(34) }}>{t.by}</div>
    </AbsoluteFill>
  );
};

/** Google Flow için metinsiz başlangıç karesi: ürün, sahne ışığı ve koyu zemin. */
export const FlowStart = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 62%, #1b1f23 0, ${C.bg} 62%)` }}>
    <Stage f={T.f1 - 10} />
  </AbsoluteFill>
);

export const Ad = ({ lang = 'tr' }) => {
  useFonts();
  const f = useCurrentFrame();
  const t = TEXT[lang];
  const fl = T.f2 - T.f1;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 62%, #1b1f23 0, ${C.bg} 62%)` }}>
      <Stage f={f} />
      <TopShade />
      <Overlays f={f} t={t} />
      <Sequence durationInFrames={T.hero + 4}><Hook t={t} /></Sequence>
      <Sequence from={T.hero} durationInFrames={T.f1 - T.hero}><Hero t={t} /></Sequence>
      {[T.f1, T.f2, T.f3].map((s, n) => <Sequence key={n} from={s} durationInFrames={fl}><Feature t={t} n={n} len={fl} /></Sequence>)}
      <Sequence from={T.methods} durationInFrames={T.end - T.methods}><Methods t={t} /></Sequence>
      <Sequence from={T.end}><End t={t} /></Sequence>
    </AbsoluteFill>
  );
};
