// Texture engine (SVG half): halftone patterns, print filters, editorial typography components.
import { el, frag, PAL, W, H, T, clamp } from './util.js';

let FONT_CSS = '';

// Loads the font files as data URLs so they are embedded inside the SVG itself.
// This makes the exact same SVG renderable both live and as an export frame image.
export async function loadFonts() {
  const toData = async (url) => {
    const buf = await (await fetch(url)).arrayBuffer();
    let bin = '';
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return `data:font/woff2;base64,${btoa(bin)}`;
  };
  const [anton, oswald] = await Promise.all([toData('fonts/anton.woff2'), toData('fonts/oswald-600.woff2')]);
  FONT_CSS = `@font-face{font-family:'RamAnton';src:url(${anton}) format('woff2');font-weight:400;}
@font-face{font-family:'RamOswald';src:url(${oswald}) format('woff2');font-weight:600;}`;
  // Register with the document too, so layout measurement uses the real glyphs.
  const ff1 = new FontFace('RamAnton', `url(${anton})`);
  const ff2 = new FontFace('RamOswald', `url(${oswald})`, { weight: '600' });
  await Promise.all([ff1.load(), ff2.load()]);
  document.fonts.add(ff1);
  document.fonts.add(ff2);
  return FONT_CSS;
}

export function buildDefs() {
  const dot = (id, color, r, gap, rot = 45, bg) => `
    <pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rot})">
      ${bg ? `<rect width="${gap}" height="${gap}" fill="${bg}"/>` : ''}
      <circle cx="${gap / 2}" cy="${gap / 2}" r="${r}" fill="${color}"/>
    </pattern>`;
  const lines = (id, color, w, gap, rot) => `
    <pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse" patternTransform="rotate(${rot})">
      <rect width="${w}" height="${gap}" fill="${color}"/>
    </pattern>`;
  const fade = (id, x1, y1, x2, y2, stops) => `
    <linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
      ${stops.map(([o, a]) => `<stop offset="${o}" stop-color="#fff" stop-opacity="${a}"/>`).join('')}
    </linearGradient>`;

  const defs = el('defs');
  defs.innerHTML = `
    <style>
      ${FONT_CSS}
      .t-big{font-family:'RamAnton',Impact,sans-serif;letter-spacing:1px;}
      .t-sub{font-family:'RamOswald','RamAnton',sans-serif;font-weight:600;letter-spacing:6px;}
      .ink{stroke:${PAL.ink};stroke-linejoin:round;stroke-linecap:round;}
    </style>
    ${dot('ht-ink', PAL.ink, 2.1, 8)}
    ${dot('ht-ink-lg', PAL.ink, 3.6, 12)}
    ${dot('ht-navy', PAL.navy, 3.2, 11)}
    ${dot('ht-navy-lg', PAL.navy, 5, 15)}
    ${dot('ht-red', PAL.red, 3.4, 11)}
    ${dot('ht-deep', PAL.deepRed, 3, 10)}
    ${dot('ht-gold', PAL.gold, 3.4, 11)}
    ${dot('ht-cream', PAL.cream, 2.6, 10)}
    ${dot('ht-cream-lg', PAL.cream, 4.5, 14)}
    ${dot('ht-blue', PAL.blue, 3.2, 10)}
    ${dot('ht-green', PAL.green, 3, 10)}
    ${dot('ht-olive', PAL.olive, 3.4, 11)}
    ${dot('ht-orange', PAL.orange, 3.4, 11)}
    ${dot('ht-fine', PAL.ink, 1.25, 6, 30)}
    ${dot('ht-skin-b', PAL.ramaShade, 1.9, 7, 15)}
    ${dot('ht-skin-w', PAL.warmShade, 1.9, 7, 15)}
    ${dot('ht-skin-h', PAL.hanuShade, 2, 7, 15)}
    ${lines('hatch-ink', PAL.ink, 2, 9, 35)}
    ${lines('hatch-navy', PAL.navy, 3, 12, -30)}
    ${lines('hatch-gold', PAL.gold, 4, 14, 20)}
    ${fade('fadeDown', 0, 0, 0, 1, [[0, 1], [0.55, 0.35], [1, 0]])}
    ${fade('fadeUp', 0, 1, 0, 0, [[0, 1], [0.6, 0.3], [1, 0]])}
    ${fade('fadeRight', 0, 0, 1, 0, [[0, 0], [1, 1]])}
    <radialGradient id="fadeRad" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset="0.6" stop-color="#fff" stop-opacity="0.25"/>
      <stop offset="1" stop-color="#fff" stop-opacity="1"/>
    </radialGradient>
    <radialGradient id="fadeRadIn" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#fff" stop-opacity="1"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <mask id="m-fadeDown" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#fadeDown)"/></mask>
    <mask id="m-fadeUp" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#fadeUp)"/></mask>
    <mask id="m-vign" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#fadeRad)"/></mask>
    <mask id="m-radIn" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#fadeRadIn)"/></mask>
    <filter id="rough" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7"/>
      <feDisplacementMap in="SourceGraphic" scale="5"/>
    </filter>
    <filter id="rough-lg" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="3"/>
      <feDisplacementMap in="SourceGraphic" scale="12"/>
    </filter>
    <filter id="sil-navy" x="-10%" y="-10%" width="120%" height="120%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="6" result="d"/>
      <feFlood flood-color="${PAL.gold}"/><feComposite in2="d" operator="in" result="rim"/>
      <feFlood flood-color="${PAL.navy}"/><feComposite in2="SourceAlpha" operator="in" result="body"/>
      <feMerge><feMergeNode in="rim"/><feMergeNode in="body"/></feMerge>
    </filter>
    <filter id="sil-ink" x="-10%" y="-10%" width="120%" height="120%">
      <feFlood flood-color="${PAL.ink}"/><feComposite in2="SourceAlpha" operator="in"/>
    </filter>
    <clipPath id="frameClip"><rect width="${W}" height="${H}"/></clipPath>
  `;
  return defs;
}

// Halftone shading overlay — a dot field faded with a mask (classic printed gradient).
export function halftoneField({ x = 0, y = 0, w = W, h = H, pattern = 'ht-navy', mask = 'm-fadeDown', opacity = 0.8 }) {
  return el('rect', { x, y, width: w, height: h, fill: `url(#${pattern})`, mask: mask ? `url(#${mask})` : null, opacity });
}

// Measure text with the live document font.
let _measure;
export function measure(text, size, cls = 't-big', ls = 1) {
  if (!_measure) {
    _measure = el('text', { x: -9999, y: -9999 });
    document.getElementById('film').appendChild(_measure);
  }
  _measure.setAttribute('class', cls);
  _measure.setAttribute('font-size', size);
  _measure.setAttribute('letter-spacing', ls);
  _measure.textContent = text;
  return _measure.getComputedTextLength();
}

/**
 * Editorial headline: oversized condensed italic caps, navy offset shadow,
 * CMYK-misregistered red plate and an ink outline. Each word is a separate
 * group so it can animate word-by-word.
 */
export function headline(text, { size = 150, fill = PAL.gold, shadow = PAL.navy, plate = PAL.red, outline = PAL.ink, sw = 7, dx = 11, dy = 11, skew = -9, cls = 't-big', ls = 1, anchor = 'middle', gap = 0.26 } = {}) {
  const words = text.split(' ');
  const widths = words.map((w) => measure(w, size, cls, ls));
  const space = size * gap;
  const total = widths.reduce((a, b) => a + b, 0) + space * (words.length - 1);
  let cx = anchor === 'middle' ? -total / 2 : anchor === 'end' ? -total : 0;
  const root = el('g', { class: 'headline' });
  const inner = el('g', { transform: `skewX(${skew})` });
  root.appendChild(inner);
  const wordNodes = words.map((w, i) => {
    const g = el('g');
    const wx = cx + widths[i] / 2;
    const base = { 'font-size': size, 'text-anchor': 'middle', class: cls, 'letter-spacing': ls };
    const inside = el('g', { transform: `translate(${wx.toFixed(1)} 0)` });
    if (shadow) inside.appendChild(el('text', { ...base, x: dx, y: dy, fill: shadow, stroke: shadow, 'stroke-width': sw, 'stroke-linejoin': 'round' }, w));
    if (plate) inside.appendChild(el('text', { ...base, x: -4, y: 3, fill: plate, opacity: 0.55 }, w));
    inside.appendChild(el('text', { ...base, x: 0, y: 0, fill, stroke: outline || 'none', 'stroke-width': outline ? sw * 0.55 : 0, 'paint-order': 'stroke', 'stroke-linejoin': 'round' }, w));
    // dotted print texture inside the letters
    inside.appendChild(el('text', { ...base, x: 0, y: 0, fill: 'url(#ht-fine)', opacity: 0.18 }, w));
    g.appendChild(inside);
    inner.appendChild(g);
    cx += widths[i] + space;
    return { g, x: wx, w: widths[i] };
  });
  return { node: root, words: wordNodes, width: total, size };
}

// Small spaced kicker label (e.g. "AN ANCIENT EPIC")
export function kicker(text, { size = 46, fill = PAL.cream, bg = PAL.red, pad = 26, ls = 8 } = {}) {
  const w = measure(text, size, 't-sub', ls) + pad * 2;
  const h = size * 1.45;
  const g = el('g');
  g.innerHTML = `
    <path d="M${-w / 2 - 14},${-h / 2 + 6} L${w / 2 + 6},${-h / 2} L${w / 2 + 16},${h / 2 - 4} L${-w / 2 - 4},${h / 2 + 4} Z" fill="${PAL.navy}" transform="translate(9 9)"/>
    <path d="M${-w / 2 - 14},${-h / 2 + 6} L${w / 2 + 6},${-h / 2} L${w / 2 + 16},${h / 2 - 4} L${-w / 2 - 4},${h / 2 + 4} Z" fill="${bg}" stroke="${PAL.ink}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M${-w / 2 - 14},${-h / 2 + 6} L${w / 2 + 6},${-h / 2} L${w / 2 + 16},${h / 2 - 4} L${-w / 2 - 4},${h / 2 + 4} Z" fill="url(#ht-deep)" opacity="0.35"/>
    <text class="t-sub" font-size="${size}" letter-spacing="${ls}" text-anchor="middle" y="${size * 0.36}" fill="${fill}">${text}</text>`;
  return { node: g, width: w, height: h };
}

// Animated underline / highlight stroke under a word
export function underline(width, { color = PAL.red, thickness = 18 } = {}) {
  const p = el('path', {
    d: `M${-width / 2},0 C${-width / 4},${-thickness * 0.4} ${width / 4},${thickness * 0.5} ${width / 2},-4`,
    stroke: color, 'stroke-width': thickness, fill: 'none', 'stroke-linecap': 'round',
    'stroke-dasharray': width * 1.1, 'stroke-dashoffset': width * 1.1,
  });
  return { node: p, len: width * 1.1, set: (k) => p.setAttribute('stroke-dashoffset', (width * 1.1 * (1 - clamp(k))).toFixed(1)) };
}

// Slam-in animation for a headline's words (scale from big + settle), deterministic in t.
export function animateWords(h, t, start, { stagger = 0.12, dur = 0.38, from = 2.4, rise = 0, out = null, outDur = 0.3, mode = 'slam' } = {}) {
  h.words.forEach((wd, i) => {
    const t0 = start + i * stagger;
    let k = clamp((t - t0) / dur);
    let op = k > 0 ? 1 : 0;
    let s = 1, y = 0, x = 0, r = 0;
    if (mode === 'slam') {
      const e = 1 - Math.pow(1 - k, 3);
      s = from + (1 - from) * e;
      if (k >= 1) s = 1 + Math.sin(clamp((t - t0 - dur) / 0.25) * Math.PI) * 0.04;
      op = clamp(k * 4);
    } else if (mode === 'rise') {
      const e = 1 - Math.pow(1 - k, 4);
      y = (1 - e) * h.size * 1.3;
      op = clamp(k * 3);
    } else if (mode === 'left') {
      const e = 1 - Math.pow(1 - k, 4);
      x = (1 - e) * -W;
    } else if (mode === 'right') {
      const e = 1 - Math.pow(1 - k, 4);
      x = (1 - e) * W;
    } else if (mode === 'drop') {
      const e = k < 1 ? 1 - Math.pow(1 - k, 3) : 1;
      y = (1 - e) * -h.size * 2.4;
      r = (1 - e) * (i % 2 ? 9 : -9);
    }
    if (out !== null) {
      const ko = clamp((t - out - i * stagger * 0.5) / outDur);
      if (ko > 0) {
        const e = ko * ko;
        s *= 1 - e * 0.6;
        y += -e * 40;
        op *= 1 - e;
      }
    }
    wd.g.setAttribute('transform', `translate(${(wd.x + x).toFixed(1)} ${y.toFixed(1)}) rotate(${r.toFixed(2)}) scale(${s.toFixed(4)}) translate(${(-wd.x).toFixed(1)} 0)`);
    wd.g.setAttribute('opacity', op.toFixed(3));
  });
}

// Paper-cut irregular polygon (seeded) — used for wipes and torn-edge panels
export function tornEdgePath(x0, x1, y, amp, step, seed, down = true, depth = H * 2) {
  let s = seed;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  let d = `M${x0},${y}`;
  for (let x = x0; x <= x1; x += step) d += ` L${x.toFixed(1)},${(y + (r() - 0.5) * amp).toFixed(1)}`;
  d += ` L${x1},${y + (down ? depth : -depth)} L${x0},${y + (down ? depth : -depth)} Z`;
  return d;
}

export { T };
