// Reusable background components (markup builders). All return SVG markup strings.
import { PAL, rng } from '../core/util.js';

const INK = PAL.ink;
export const BARK = '#6E3B1F';

export function sun(r = 260, { rays = 24, color = PAL.gold } = {}) {
  let rayD = '';
  for (let i = 0; i < rays; i++) {
    const a0 = (i / rays) * Math.PI * 2, a1 = a0 + Math.PI / rays;
    const R = r * 1.9;
    rayD += `M0,0 L${(Math.cos(a0) * R).toFixed(1)},${(Math.sin(a0) * R).toFixed(1)} L${(Math.cos(a1) * R).toFixed(1)},${(Math.sin(a1) * R).toFixed(1)} Z `;
  }
  return `<g class="sun-rays"><path d="${rayD}" fill="${color}" opacity="0.35"/></g>
    <circle r="${r + 28}" fill="none" stroke="${PAL.red}" stroke-width="10" stroke-dasharray="4 22" opacity="0.8"/>
    <circle r="${r}" fill="${color}" stroke="${INK}" stroke-width="7"/>
    <circle r="${r}" fill="url(#ht-orange)" mask="url(#m-vign)" opacity="0.9"/>
    <circle r="${r * 0.72}" fill="none" stroke="${PAL.orange}" stroke-width="6" stroke-dasharray="2 14" opacity="0.8"/>`;
}

export function dome(cx, y, w, h, fill = PAL.gold, shade = 'ht-orange', sw = 5) {
  const d = `M${cx - w / 2},${y} C${cx - w / 2},${y - h * 0.62} ${cx - w * 0.08},${y - h * 0.7} ${cx},${y - h} C${cx + w * 0.08},${y - h * 0.7} ${cx + w / 2},${y - h * 0.62} ${cx + w / 2},${y} Z`;
  const s = `M${cx - w / 2},${y} C${cx - w / 2},${y - h * 0.62} ${cx - w * 0.08},${y - h * 0.7} ${cx},${y - h} C${cx - w * 0.15},${y - h * 0.6} ${cx - w * 0.2},${y - h * 0.3} ${cx - w * 0.15},${y} Z`;
  return `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>
    ${shade ? `<path d="${s}" fill="url(#${shade})" opacity="0.85"/>` : ''}
    <path d="M${cx},${y - h} L${cx},${y - h - h * 0.28}" stroke="${INK}" stroke-width="${sw}"/>
    <circle cx="${cx}" cy="${y - h - h * 0.05}" r="${Math.max(4, w * 0.05)}" fill="${fill}" stroke="${INK}" stroke-width="${sw * 0.6}"/>`;
}

export function flag(x, y, h = 90, color = PAL.red, wave = 0) {
  return `<path d="M${x},${y} L${x},${y - h}" stroke="${INK}" stroke-width="5"/>
    <path class="flag" d="M${x},${y - h} C${x + 30},${y - h - 10 + wave} ${x + 40},${y - h + 14 - wave} ${x + 70},${y - h + 8} L${x},${y - h + 40} Z" fill="${color}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
}

function arches(x0, x1, y, h, n, fill = PAL.navy) {
  let s = '';
  const w = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    const cx = x0 + w * i + w / 2, aw = w * 0.56;
    s += `<path d="M${cx - aw / 2},${y} L${cx - aw / 2},${y - h * 0.6} C${cx - aw / 2},${y - h * 0.9} ${cx},${y - h} ${cx},${y - h} C${cx},${y - h} ${cx + aw / 2},${y - h * 0.9} ${cx + aw / 2},${y - h * 0.6} L${cx + aw / 2},${y} Z" fill="${fill}" stroke="${INK}" stroke-width="4"/>`;
  }
  return s;
}

/** Detailed palace (Ayodhya style). Ground at y=0, centered at x=0, ~900 wide. */
export function palace({ main = PAL.gold, trim = PAL.red, arch = PAL.navy, shade = 'ht-orange', flags = true } = {}) {
  return `
    <rect x="-440" y="-260" width="880" height="260" fill="${main}" stroke="${INK}" stroke-width="6"/>
    <rect x="-440" y="-260" width="880" height="260" fill="url(#${shade})" mask="url(#m-fadeUp)" opacity="0.8"/>
    <rect x="-460" y="-280" width="920" height="28" fill="${trim}" stroke="${INK}" stroke-width="5"/>
    <path d="M-460,-266 L460,-266" stroke="${PAL.gold}" stroke-width="5" stroke-dasharray="10 10"/>
    ${arches(-420, 420, -10, 170, 7, arch)}
    <rect x="-180" y="-460" width="360" height="190" fill="${main}" stroke="${INK}" stroke-width="6"/>
    <rect x="-180" y="-460" width="120" height="190" fill="url(#${shade})" opacity="0.7"/>
    ${arches(-160, 160, -290, 140, 3, arch)}
    <rect x="-200" y="-480" width="400" height="26" fill="${trim}" stroke="${INK}" stroke-width="5"/>
    ${dome(0, -480, 300, 280, main, shade)}
    <rect x="-420" y="-520" width="110" height="260" fill="${main}" stroke="${INK}" stroke-width="6"/>
    <rect x="310" y="-520" width="110" height="260" fill="${main}" stroke="${INK}" stroke-width="6"/>
    <rect x="-420" y="-520" width="40" height="260" fill="url(#${shade})" opacity="0.7"/>
    <rect x="310" y="-520" width="40" height="260" fill="url(#${shade})" opacity="0.7"/>
    ${arches(-410, -320, -300, 120, 1, arch)}${arches(320, 410, -300, 120, 1, arch)}
    <rect x="-432" y="-540" width="134" height="24" fill="${trim}" stroke="${INK}" stroke-width="5"/>
    <rect x="298" y="-540" width="134" height="24" fill="${trim}" stroke="${INK}" stroke-width="5"/>
    ${dome(-365, -540, 120, 150, main, shade)}${dome(365, -540, 120, 150, main, shade)}
    ${dome(-250, -280, 90, 100, main, shade)}${dome(250, -280, 90, 100, main, shade)}
    ${flags ? flag(-365, -700, 90) + flag(365, -700, 90) + flag(0, -840, 110) : ''}`;
}

/** Flat silhouette skyline for far layers. */
export function skyline(color, seed = 1, w = 1600, base = 0) {
  const r = rng(seed);
  let s = '';
  let x = -w / 2;
  while (x < w / 2) {
    const bw = 90 + r() * 140, bh = 120 + r() * 260;
    s += `<rect x="${x.toFixed(0)}" y="${(base - bh).toFixed(0)}" width="${bw.toFixed(0)}" height="${bh.toFixed(0)}" fill="${color}"/>`;
    if (r() > 0.35) s += dome(x + bw / 2, base - bh, bw * 0.8, bw * (0.7 + r() * 0.5), color, null, 0.01);
    if (r() > 0.7) s += `<path d="M${x + bw / 2},${base - bh - bw} l0,-60 l40,12 l-40,18" fill="${color}" stroke="${color}" stroke-width="4"/>`;
    x += bw + 10 + r() * 30;
  }
  return s;
}

/** Oversized geometric tree with ink outline union. Ground at 0. */
export function tree({ seed = 1, h = 900, w = 520, leaf = PAL.green, light = PAL.olive, trunk = BARK, dots = 'ht-navy' } = {}) {
  const r = rng(seed);
  const tw = w * 0.13;
  let blobs = [];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r();
    const rad = (0.22 + r() * 0.2) * w;
    blobs.push([Math.cos(a) * w * 0.3, -h * 0.68 + Math.sin(a) * h * 0.17, rad]);
  }
  blobs.push([0, -h * 0.7, w * 0.36]);
  const inkC = blobs.map(([x, y, rr]) => `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(rr + 7).toFixed(0)}" fill="${INK}"/>`).join('');
  const fillC = blobs.map(([x, y, rr]) => `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${rr.toFixed(0)}" fill="${leaf}"/>`).join('');
  const hiC = blobs.slice(0, 5).map(([x, y, rr]) => `<circle cx="${(x + rr * 0.15).toFixed(0)}" cy="${(y - rr * 0.25).toFixed(0)}" r="${(rr * 0.55).toFixed(0)}" fill="${light}"/>`).join('');
  const dotC = blobs.map(([x, y, rr]) => `<circle cx="${(x - rr * 0.15).toFixed(0)}" cy="${(y + rr * 0.2).toFixed(0)}" r="${(rr * 0.8).toFixed(0)}" fill="url(#${dots})"/>`).join('');
  const leaves = Array.from({ length: 14 }, () => {
    const x = (r() - 0.5) * w * 0.9, y = -h * 0.68 + (r() - 0.5) * h * 0.3;
    return `<path d="M${x.toFixed(0)},${y.toFixed(0)} q10,-18 22,0 q-10,14 -22,0z" fill="${INK}" opacity="0.55"/>`;
  }).join('');
  return `
    <path d="M${-tw},0 C${-tw * 0.8},${-h * 0.3} ${-tw * 0.4},${-h * 0.5} ${-tw * 1.6},${-h * 0.66} L${-tw * 0.6},${-h * 0.7} C${-tw * 0.1},${-h * 0.6} ${tw * 0.1},${-h * 0.6} ${tw * 0.8},${-h * 0.72} L${tw * 1.7},${-h * 0.66} C${tw * 0.5},${-h * 0.5} ${tw * 0.8},${-h * 0.3} ${tw},0 Z" fill="${trunk}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M${-tw},0 C${-tw * 0.8},${-h * 0.3} ${-tw * 0.4},${-h * 0.5} ${-tw * 1.6},${-h * 0.66} L${-tw * 0.9},${-h * 0.68} C${-tw * 0.1},${-h * 0.5} ${-tw * 0.3},${-h * 0.3} ${-tw * 0.2},0Z" fill="url(#hatch-ink)" opacity="0.6"/>
    ${inkC}${fillC}${hiC}${dotC}${leaves}`;
}

export function bush(w = 300, seed = 3, leaf = PAL.green, light = PAL.olive) {
  const r = rng(seed);
  const n = 6;
  const bl = Array.from({ length: n }, (_, i) => [(i / (n - 1) - 0.5) * w, -w * 0.15 - r() * w * 0.12, w * (0.16 + r() * 0.08)]);
  return bl.map(([x, y, rr]) => `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(rr + 6).toFixed(0)}" fill="${INK}"/>`).join('') +
    bl.map(([x, y, rr]) => `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${rr.toFixed(0)}" fill="${leaf}"/>`).join('') +
    bl.map(([x, y, rr]) => `<circle cx="${(x + 6).toFixed(0)}" cy="${(y - rr * 0.3).toFixed(0)}" r="${(rr * 0.45).toFixed(0)}" fill="${light}"/>`).join('') +
    `<rect x="${-w / 2 - 40}" y="-10" width="${w + 80}" height="40" fill="${leaf}"/>`;
}

// Banana / palm frond plant (Panchavati vegetation)
export function frondPlant(h = 420, color = PAL.green, light = PAL.olive) {
  let s = `<path d="M-10,0 C-6,${-h * 0.4} 4,${-h * 0.6} 0,${-h * 0.75}" stroke="${INK}" stroke-width="18" fill="none"/>
    <path d="M-10,0 C-6,${-h * 0.4} 4,${-h * 0.6} 0,${-h * 0.75}" stroke="${PAL.olive}" stroke-width="9" fill="none"/>`;
  const fronds = [[-70, 1], [-30, 0.9], [10, 1.1], [50, 0.95], [90, 0.85], [-110, 0.8]];
  fronds.forEach(([a, k], i) => {
    const L = h * 0.5 * k;
    s += `<g transform="translate(0 ${-h * 0.75}) rotate(${a})">
      <path d="M0,0 C${L * 0.3},${-L * 0.25} ${L * 0.7},${-L * 0.2} ${L},0 C${L * 0.7},${L * 0.16} ${L * 0.3},${L * 0.18} 0,0Z" fill="${i % 2 ? light : color}" stroke="${INK}" stroke-width="5"/>
      <path d="M0,0 L${L * 0.95},0" stroke="${INK}" stroke-width="3"/>
      <path d="M0,0 C${L * 0.3},${L * 0.18} ${L * 0.7},${L * 0.16} ${L},0Z" fill="url(#ht-navy)" opacity="0.5"/>
    </g>`;
  });
  return s;
}

export function hut() {
  return `
    <rect x="-200" y="-220" width="400" height="220" fill="${PAL.olive}" stroke="${INK}" stroke-width="6"/>
    <rect x="-200" y="-220" width="400" height="220" fill="url(#hatch-ink)" opacity="0.35"/>
    <path d="M-60,0 L-60,-150 C-60,-180 60,-180 60,-150 L60,0Z" fill="${INK}"/>
    <path d="M-270,-200 C-200,-330 -80,-420 0,-440 C80,-420 200,-330 270,-200 C140,-180 -140,-180 -270,-200Z" fill="${PAL.gold}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M-270,-200 C-200,-330 -80,-420 0,-440 C-60,-380 -100,-280 -110,-190 C-160,-190 -220,-194 -270,-200Z" fill="url(#ht-orange)" opacity="0.9"/>
    <path d="M-220,-215 L-160,-330 M-150,-200 L-90,-370 M-70,-195 L-30,-410 M10,-195 L20,-420 M90,-198 L80,-390 M160,-205 L140,-340 M220,-215 L190,-290" stroke="${INK}" stroke-width="3.5" opacity="0.8"/>
    <path d="M0,-440 L0,-480" stroke="${INK}" stroke-width="6"/>`;
}

export function mountains(color, light, w = 1800, h = 700, seed = 4) {
  const r = rng(seed);
  let d = `M${-w / 2},0`;
  let hl = '';
  const n = 6;
  for (let i = 0; i < n; i++) {
    const x0 = -w / 2 + (i / n) * w, x1 = -w / 2 + ((i + 1) / n) * w;
    const px = (x0 + x1) / 2 + (r() - 0.5) * 80, py = -h * (0.5 + r() * 0.5);
    d += ` L${px.toFixed(0)},${py.toFixed(0)} L${x1.toFixed(0)},${(-h * r() * 0.2).toFixed(0)}`;
    hl += `<path d="M${px.toFixed(0)},${py.toFixed(0)} L${(px + 90).toFixed(0)},${(py + h * 0.35).toFixed(0)} L${(px + 20).toFixed(0)},${(py + h * 0.3).toFixed(0)} L${(px - 30).toFixed(0)},${(py + h * 0.5).toFixed(0)} Z" fill="${light}"/>`;
  }
  d += ` L${w / 2},400 L${-w / 2},400 Z`;
  return `<path d="${d}" fill="${color}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>${hl}
    <path d="${d}" fill="url(#ht-ink)" mask="url(#m-fadeUp)" opacity="0.5"/>`;
}

export function cloud(w = 320, fill = PAL.cream) {
  const r = w / 5;
  return `<path d="M${-w / 2},0 C${-w / 2},${-r * 1.2} ${-w / 2 + r * 1.2},${-r * 1.6} ${-w / 2 + r * 1.8},${-r * 0.9} C${-r * 1.2},${-r * 2.6} ${r * 0.6},${-r * 2.8} ${r * 0.9},${-r * 1.2} C${r * 1.6},${-r * 2} ${w / 2},${-r * 1.4} ${w / 2},0 Z" fill="${fill}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M${-w / 2 + r},-14 C${-r},-${r * 0.8} ${r},-${r * 0.8} ${w / 2 - r},-14" stroke="${PAL.skyBlue}" stroke-width="4" fill="none"/>
    <path d="M${-w / 2},0 L${w / 2},0 L${w / 2 - 10},-${r * 0.5} L${-w / 2 + 10},-${r * 0.5}Z" fill="url(#ht-blue)" opacity="0.5"/>`;
}

// Repeating hand-drawn curling wave band; width = n * 180
export const WAVE_W = 180;
export function waveBand(n = 10, { fill = PAL.blue, crest = PAL.cream, dark = PAL.navy, h = 260 } = {}) {
  let d = 'M0,60';
  let crests = '';
  for (let i = 0; i < n; i++) {
    const x = i * WAVE_W;
    d += ` C${x + 40},60 ${x + 50},0 ${x + 100},4 C${x + 140},6 ${x + 150},40 ${x + 128},56 C${x + 118},44 ${x + 102},44 ${x + 106},62 C${x + 112},76 ${x + 150},70 ${x + 180},60`;
    crests += `<path d="M${x + 60},26 C${x + 76},8 ${x + 104},6 ${x + 122},22" stroke="${crest}" stroke-width="9" fill="none" stroke-linecap="round"/>
      <circle cx="${x + 142}" cy="24" r="7" fill="${crest}" stroke="${INK}" stroke-width="3"/>
      <path d="M${x + 20},110 C${x + 60},96 ${x + 100},96 ${x + 150},112" stroke="${crest}" stroke-width="5" fill="none" opacity="0.7"/>`;
  }
  d += ` L${n * WAVE_W},${h} L0,${h} Z`;
  return `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
    <rect x="0" y="80" width="${n * WAVE_W}" height="${h - 80}" fill="url(#ht-navy)" opacity="0.6"/>
    <rect x="0" y="150" width="${n * WAVE_W}" height="${h - 150}" fill="${dark}" opacity="0.35"/>
    ${crests}`;
}

export function lanka({ main = PAL.gold, rock = PAL.navy } = {}) {
  return `
    <path d="M-560,0 C-480,-160 -420,-260 -300,-300 C-180,-340 -120,-380 0,-390 C120,-380 200,-330 320,-300 C440,-260 500,-150 560,0 Z" fill="${rock}" stroke="${INK}" stroke-width="7"/>
    <path d="M-560,0 C-480,-160 -420,-260 -300,-300 L-200,-200 L-260,-80 L-180,0Z M120,-380 L60,-250 L160,-160 L120,0 L300,0 L220,-160 L320,-300Z" fill="url(#hatch-ink)" opacity="0.6"/>
    <path d="M-300,-300 L-240,-160 M0,-390 L-40,-200 L20,-60 M320,-300 L260,-180" stroke="${PAL.blue}" stroke-width="6" fill="none"/>
    <g transform="translate(0 -380) scale(0.62)">${palace({ main, trim: PAL.red, arch: PAL.ink, shade: 'ht-red', flags: true })}</g>
    <g transform="translate(-300 -300) scale(0.34)">${dome(0, 0, 300, 420, main, 'ht-red')}<rect x="-150" y="0" width="300" height="300" fill="${main}" stroke="${INK}" stroke-width="10"/></g>
    <g transform="translate(320 -300) scale(0.34)">${dome(0, 0, 300, 420, main, 'ht-red')}<rect x="-150" y="0" width="300" height="300" fill="${main}" stroke="${INK}" stroke-width="10"/></g>`;
}

export function diya() {
  return `<path d="M-40,0 C-36,26 36,26 40,0 Z" fill="${PAL.red}" stroke="${INK}" stroke-width="4"/>
    <path d="M-40,0 C-36,26 -10,26 0,26 C-16,20 -24,10 -26,0Z" fill="url(#ht-deep)" opacity="0.8"/>
    <path d="M-46,0 L46,0" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    <path d="M-40,8 L40,8" stroke="${PAL.gold}" stroke-width="3" stroke-dasharray="4 6"/>`;
}
export function flameD(k = 1) {
  return `M0,-4 C-12,-10 -12,-30 0,${(-52 * k).toFixed(1)} C12,-30 12,-10 0,-4Z`;
}

export function ground(color, w = 2400, h = 600, pattern = 'ht-navy') {
  return `<rect x="${-w / 2}" y="0" width="${w}" height="${h}" fill="${color}" stroke="${INK}" stroke-width="7"/>
    <rect x="${-w / 2}" y="0" width="${w}" height="${h}" fill="url(#${pattern})" opacity="0.5"/>`;
}

export function stone(seed, w = 150, h = 90) {
  const r = rng(seed);
  const pts = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return [Math.cos(a) * (w / 2) * (0.85 + r() * 0.2), Math.sin(a) * (h / 2) * (0.85 + r() * 0.2)];
  });
  const d = 'M' + pts.map((p) => p.map((v) => v.toFixed(0)).join(',')).join(' L') + ' Z';
  return `<path d="${d}" fill="#C9B48A" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M${-w / 2 + 10},4 C${-w / 4},${h / 2} ${w / 4},${h / 2} ${w / 2 - 10},6 L${w / 2 - 14},${h / 2 - 6} L${-w / 2 + 14},${h / 2 - 6}Z" fill="url(#ht-ink)" opacity="0.6"/>
    <text x="0" y="${h * 0.14}" class="t-big" font-size="${h * 0.4}" letter-spacing="3" text-anchor="middle" fill="${PAL.red}" opacity="0.85">RAMA</text>`;
}

export function burst(n = 28, R = 1400, color = PAL.gold, r0 = 0) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = a0 + Math.PI / n;
    d += `M${(Math.cos(a0) * r0).toFixed(1)},${(Math.sin(a0) * r0).toFixed(1)} L${(Math.cos(a0) * R).toFixed(1)},${(Math.sin(a0) * R).toFixed(1)} L${(Math.cos(a1) * R).toFixed(1)},${(Math.sin(a1) * R).toFixed(1)} L${(Math.cos(a1) * r0).toFixed(1)},${(Math.sin(a1) * r0).toFixed(1)}Z `;
  }
  return `<path d="${d}" fill="${color}"/>`;
}

// Comic impact star
export function impact(r = 160, fill = PAL.gold, stroke = PAL.ink) {
  let d = '';
  const n = 14;
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2;
    const rr = i % 2 ? r * 0.5 : r * (0.9 + ((i * 37) % 7) / 30);
    d += `${i ? 'L' : 'M'}${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)} `;
  }
  return `<path d="${d}Z" fill="${fill}" stroke="${stroke}" stroke-width="7" stroke-linejoin="round"/>
    <path d="${d}Z" fill="url(#ht-red)" opacity="0.5" transform="scale(0.6)"/>`;
}

// Construction-style callout label (Scene 7)
export function label(text, w = 300) {
  return `<g><rect x="0" y="-34" width="${w}" height="52" fill="${PAL.cream}" stroke="${INK}" stroke-width="4"/>
    <rect x="0" y="-34" width="14" height="52" fill="${PAL.red}"/>
    <text x="28" y="4" class="t-sub" font-size="28" letter-spacing="4" fill="${PAL.ink}">${text}</text></g>`;
}
