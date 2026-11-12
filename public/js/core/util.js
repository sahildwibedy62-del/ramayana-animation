// Shared deterministic helpers: easing, interpolation, seeded RNG, SVG element creation.
export const SVGNS = 'http://www.w3.org/2000/svg';
export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const DURATION = 60;
export const TOTAL_FRAMES = FPS * DURATION; // 1800

export const PAL = {
  navy: '#101B50',
  blue: '#174A8B',
  cream: '#FFF0C9',
  gold: '#FFD629',
  red: '#F04426',
  green: '#245B39',
  olive: '#82934D',
  ink: '#111319',
  // Controlled tints derived from the palette (for skin and light passes only)
  skyBlue: '#5C93D3',
  ramaSkin: '#5A8FD8',
  ramaShade: '#2F63AE',
  warmSkin: '#F2AE72',
  warmShade: '#D7834A',
  hanu: '#E47A2E',
  hanuShade: '#B4521F',
  paper: '#F6E3B4',
  deepRed: '#B8281A',
  orange: '#F7942F',
};

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const inv = (a, b, v) => clamp((v - a) / (b - a));
export const map = (v, a, b, c, d) => lerp(c, d, inv(a, b, v));

export const ease = {
  linear: (t) => t,
  inQuad: (t) => t * t,
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inCubic: (t) => t * t * t,
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inExpo: (t) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
  outBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  outElastic: (t) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
  },
};

// Tween value from a→b across [t0,t1] with easing; clamped outside the window.
export const tw = (t, t0, t1, a, b, e = ease.outCubic) => lerp(a, b, e(inv(t0, t1, t)));

// Keyframe track: [[time, value, easing?], ...]
export function track(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, e] = keys[i];
    const [t0, v0] = keys[i - 1];
    if (t <= t1) return lerp(v0, v1, (e || ease.inOutCubic)(inv(t0, t1, t)));
  }
  return keys[keys.length - 1][1];
}

// Mulberry32 seeded RNG — deterministic per seed
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Stepped "hand animated" time: quantises motion to 2s/3s like cutout animation
export const onTwos = (t, fps = 15) => Math.floor(t * fps) / fps;

export function el(tag, attrs = {}, children = []) {
  const n = document.createElementNS(SVGNS, tag);
  for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) n.setAttribute(k, attrs[k]);
  for (const c of [].concat(children)) if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  return n;
}

// Build from an SVG markup string (inside a <g>)
export function frag(markup, attrs = {}) {
  const g = el('g', attrs);
  g.innerHTML = markup;
  return g;
}

export const T = (x = 0, y = 0, r = 0, s = 1, sy) =>
  `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${r.toFixed(2)}) scale(${s.toFixed(4)} ${(sy ?? s).toFixed(4)})`;

export const set = (node, attrs) => {
  for (const k in attrs) node.setAttribute(k, attrs[k]);
};

export const fmtTime = (t) => {
  const s = Math.floor(t);
  const f = Math.floor((t - s) * FPS + 1e-6);
  return `00:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
};
