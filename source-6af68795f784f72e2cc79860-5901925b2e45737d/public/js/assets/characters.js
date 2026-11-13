// Reusable 2D cutout character rigs. Every character is built from ONE definition
// here so proportions, colours and faces stay identical in every scene.
import { el, PAL, clamp } from '../core/util.js';

const INK = PAL.ink;
const SW = 5; // base ink outline width
const CHARACTER_REGISTRY = {};
export const registry = CHARACTER_REGISTRY;
const register = (name) => {
  CHARACTER_REGISTRY[name] = (CHARACTER_REGISTRY[name] || 0) + 1;
};

const MUZZLE = '#F7C98E';

function g(attrs = {}, html = '') {
  const n = el('g', attrs);
  if (html) n.innerHTML = html;
  return n;
}

// Tapered limb with halftone shade on the back edge.
function limbPath(a, b, L) {
  return `M${-a},0 C${-a * 1.1},${L * 0.4} ${-b * 1.05},${L * 0.75} ${-b},${L} Q0,${L + b * 0.9} ${b},${L} C${b * 1.05},${L * 0.75} ${a * 1.1},${L * 0.4} ${a},0 Q0,${-a * 0.9} ${-a},0 Z`;
}
function limbShade(a, b, L) {
  return `M${-a},0 C${-a * 1.1},${L * 0.4} ${-b * 1.05},${L * 0.75} ${-b},${L} L${-b * 0.1},${L} C${-b * 0.2},${L * 0.7} ${-a * 0.2},${L * 0.4} ${-a * 0.1},0 Z`;
}
function limb(a, b, L, fill, shade, extra = '') {
  return `<path d="${limbPath(a, b, L)}" fill="${fill}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
    <path d="${limbShade(a, b, L)}" fill="url(#${shade})" opacity="0.75"/>${extra}`;
}
const band = (y, w, color = PAL.gold) =>
  `<rect x="${-w}" y="${y}" width="${w * 2}" height="9" rx="3" fill="${color}" stroke="${INK}" stroke-width="3"/>`;

// ---------- HEADS (profile, facing right; origin = base of neck) ----------
const FACE = `M-36,-70 C-38,-104 -6,-118 22,-106 C36,-98 42,-86 42,-74 L54,-56 L44,-52 C46,-48 46,-45 43,-43 C46,-40 44,-36 40,-35 C40,-28 34,-20 22,-18 C10,-16 -4,-22 -14,-30 C-30,-42 -36,-56 -36,-70 Z`;
const FACE_F = `M-36,-70 C-38,-104 -6,-118 22,-106 C36,-98 41,-86 41,-74 L50,-57 L42,-53 C44,-49 44,-46 41,-44 C44,-41 42,-37 39,-36 C38,-29 33,-22 22,-20 C10,-18 -4,-23 -14,-31 C-30,-43 -36,-56 -36,-70 Z`;

function eyes(kind) {
  // Eye group with open + closed states so expressions can switch deterministically.
  const lash = kind === 'sita' ? `<path d="M14,-75 L9,-79 M17,-78 L13,-83" stroke="${INK}" stroke-width="2.5"/>` : '';
  return `<g class="eye-open">
      <path d="M14,-74 Q26,-84 37,-73 Q26,-67 14,-74 Z" fill="${PAL.cream}" stroke="${INK}" stroke-width="3"/>
      <circle class="pupil" cx="29" cy="-74.5" r="4.2" fill="${INK}"/>
      <path d="M13,-75 Q26,-86 38,-74" fill="none" stroke="${INK}" stroke-width="4"/>${lash}
    </g>
    <g class="eye-closed" style="display:none"><path d="M14,-73 Q26,-67 37,-72" fill="none" stroke="${INK}" stroke-width="4"/></g>
    <path class="brow" d="M13,-88 Q26,-95 39,-86" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`;
}

function humanHead(kind, skin, shadePat) {
  const face = kind === 'sita' ? FACE_F : FACE;
  let back = '', front = '';
  if (kind === 'rama' || kind === 'lakshmana') {
    back = `<path d="M-36,-70 C-40,-110 0,-124 28,-104 C14,-104 4,-96 -2,-86 C-8,-76 -10,-64 -14,-56 C-22,-40 -28,-18 -30,8 C-48,-10 -46,-48 -36,-70 Z" fill="${INK}"/>
      <path d="M-30,-80 C-34,-60 -36,-30 -32,0" stroke="${PAL.navy}" stroke-width="3" fill="none"/>`;
  }
  if (kind === 'rama') {
    front = `<path d="M-30,-100 C-8,-118 20,-116 36,-100 L34,-90 C16,-104 -10,-104 -30,-88 Z" fill="${PAL.gold}" stroke="${INK}" stroke-width="4"/>
      <path d="M-26,-104 L-24,-150 L-10,-130 L3,-174 L16,-130 L30,-150 L32,-102 C14,-116 -10,-116 -26,-104 Z" fill="${PAL.gold}" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M-26,-104 L-24,-150 L-10,-130 L-6,-112 C-14,-110 -20,-108 -26,-104Z" fill="url(#ht-red)" opacity="0.6"/>
      <circle cx="4" cy="-122" r="7" fill="${PAL.red}" stroke="${INK}" stroke-width="3"/>
      <circle cx="3" cy="-178" r="5" fill="${PAL.red}" stroke="${INK}" stroke-width="2.5"/>
      <path d="M-18,-140 L-14,-112 M24,-140 L22,-112" stroke="${PAL.red}" stroke-width="3"/>`;
  } else if (kind === 'lakshmana') {
    front = `<circle cx="-8" cy="-120" r="20" fill="${INK}"/>
      <path d="M-26,-128 C-14,-136 4,-136 12,-128" stroke="${PAL.gold}" stroke-width="7" fill="none"/>
      <path d="M-30,-100 C-8,-118 20,-116 36,-100 L34,-90 C16,-104 -10,-104 -30,-88 Z" fill="${PAL.gold}" stroke="${INK}" stroke-width="4"/>
      <path d="M2,-112 L8,-126 L14,-112 Z" fill="${PAL.gold}" stroke="${INK}" stroke-width="3"/>
      <circle cx="8" cy="-106" r="4.5" fill="${PAL.green}" stroke="${INK}" stroke-width="2"/>`;
  } else if (kind === 'sita') {
    back = `<path d="M-30,-80 C-40,-50 -44,0 -38,40 L-26,40 C-30,0 -26,-46 -20,-70 Z" fill="${INK}"/>`;
    front = `<path d="M-46,-60 C-50,-114 2,-132 32,-108 C37,-103 38,-99 36,-95 C12,-108 -14,-100 -22,-80 C-30,-56 -30,-16 -42,22 C-60,-6 -54,-38 -46,-60 Z" fill="${PAL.red}" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M36,-95 C12,-108 -14,-100 -22,-80 C-30,-56 -30,-16 -42,22" fill="none" stroke="${PAL.gold}" stroke-width="7"/>
      <path d="M-46,-60 C-50,-114 2,-132 32,-108 C12,-110 -16,-104 -30,-74 Z" fill="url(#ht-deep)" opacity="0.7"/>
      <path d="M28,-100 C18,-104 6,-102 -2,-94" fill="none" stroke="${INK}" stroke-width="6"/>`;
  }
  const extras = kind === 'sita'
    ? `<circle cx="33" cy="-92" r="4" fill="${PAL.red}" stroke="${INK}" stroke-width="1.5"/>
       <circle cx="44" cy="-48" r="4.5" fill="none" stroke="${PAL.gold}" stroke-width="2.5"/>
       <path d="M36,-38 Q40,-36 42,-39" stroke="${PAL.red}" stroke-width="4" fill="none" stroke-linecap="round"/>`
    : `<path d="M32,-104 L31,-92 M27,-104 Q31,-96 35,-104" stroke="${PAL.red}" stroke-width="3" fill="none"/>
       <path d="M35,-38 Q39,-36 42,-39" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  return `<path d="M-14,6 L-16,-34 L16,-34 L20,6 Z" fill="${skin}" stroke="${INK}" stroke-width="${SW}"/>
    <path d="M-14,6 L-16,-34 L0,-34 L2,6 Z" fill="url(#${shadePat})" opacity="0.8"/>
    ${back}
    <path d="${face}" fill="${skin}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
    <path d="M-36,-70 C-38,-96 -20,-110 0,-112 C-14,-96 -16,-60 -4,-26 C-20,-34 -36,-52 -36,-70 Z" fill="url(#${shadePat})" opacity="0.7"/>
    <path d="M-8,-74 C-18,-74 -18,-52 -6,-50" fill="${skin}" stroke="${INK}" stroke-width="3.5"/>
    ${kind === 'sita' ? '' : back ? `<path d="M-36,-70 C-30,-90 -12,-100 6,-104 C-6,-96 -10,-86 -12,-78 C-20,-80 -30,-78 -36,-70Z" fill="${INK}"/>` : ''}
    ${eyes(kind)}
    ${extras}
    <circle cx="-8" cy="-42" r="7" fill="${PAL.gold}" stroke="${INK}" stroke-width="3"/>
    <circle cx="-8" cy="-31" r="4" fill="${PAL.red}" stroke="${INK}" stroke-width="2"/>
    ${front}`;
}

function hanumanHead(crown = true) {
  const skin = PAL.hanu;
  return `<path d="M-16,6 L-18,-30 L16,-30 L20,6 Z" fill="${skin}" stroke="${INK}" stroke-width="${SW}"/>
    <circle cx="-2" cy="-68" r="44" fill="${skin}" stroke="${INK}" stroke-width="${SW}"/>
    <path d="M-46,-68 C-46,-96 -24,-112 0,-112 C-16,-96 -20,-60 -6,-26 C-28,-28 -46,-46 -46,-68Z" fill="url(#ht-skin-h)" opacity="0.8"/>
    <circle cx="-22" cy="-62" r="15" fill="${skin}" stroke="${INK}" stroke-width="4"/>
    <circle cx="-22" cy="-62" r="7" fill="${MUZZLE}"/>
    <path d="M4,-70 C24,-84 56,-76 62,-56 C66,-36 50,-22 28,-22 C10,-22 0,-34 2,-50 Z" fill="${MUZZLE}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
    <path d="M10,-34 C24,-26 44,-28 56,-40" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
    <ellipse cx="54" cy="-60" rx="6" ry="4" fill="${INK}"/>
    <g class="eye-open">
      <ellipse cx="22" cy="-82" rx="9" ry="7" fill="${PAL.cream}" stroke="${INK}" stroke-width="3"/>
      <circle class="pupil" cx="25" cy="-82" r="4" fill="${INK}"/>
    </g>
    <g class="eye-closed" style="display:none"><path d="M13,-81 Q22,-76 31,-81" fill="none" stroke="${INK}" stroke-width="4"/></g>
    <path class="brow" d="M8,-92 C18,-100 30,-98 38,-90" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    <path d="M30,-46 L30,-40" stroke="${INK}" stroke-width="2"/>
    ${crown ? `<path d="M-34,-98 C-14,-120 18,-120 34,-100 L32,-90 C14,-108 -14,-108 -34,-88 Z" fill="${PAL.gold}" stroke="${INK}" stroke-width="4"/>
    <path d="M-28,-104 L-24,-140 L-8,-124 L2,-156 L14,-124 L28,-138 L30,-104 C12,-116 -12,-116 -28,-104Z" fill="${PAL.gold}" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M-28,-104 L-24,-140 L-8,-124 L-6,-112 C-14,-110 -22,-108 -28,-104Z" fill="url(#ht-red)" opacity="0.6"/>
    <circle cx="2" cy="-118" r="6.5" fill="${PAL.red}" stroke="${INK}" stroke-width="3"/>
    <circle cx="-12" cy="-40" r="6" fill="${PAL.gold}" stroke="${INK}" stroke-width="3"/>` : `<path d="M-30,-100 C-10,-114 14,-114 28,-102" fill="none" stroke="${PAL.red}" stroke-width="8"/>`}`;
}

// ---------- BOW + QUIVER ----------
const BOW = `<path d="M-14,-170 C46,-120 50,120 -14,170" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
  <path d="M-14,-170 C46,-120 50,120 -14,170" fill="none" stroke="${PAL.gold}" stroke-width="8" stroke-linecap="round"/>
  <path d="M14,-22 L22,-22 L22,22 L14,22 Z" fill="${PAL.red}" stroke="${INK}" stroke-width="3"/>
  <circle cx="-14" cy="-170" r="7" fill="${PAL.red}" stroke="${INK}" stroke-width="3"/>
  <circle cx="-14" cy="170" r="7" fill="${PAL.red}" stroke="${INK}" stroke-width="3"/>`;

const ARROW = (len = 280) => `<line x1="0" y1="0" x2="${len}" y2="0" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
  <line x1="0" y1="0" x2="${len}" y2="0" stroke="${PAL.cream}" stroke-width="3"/>
  <path d="M${len - 8},-12 L${len + 26},0 L${len - 8},12 Z" fill="${PAL.gold}" stroke="${INK}" stroke-width="3"/>
  <path d="M8,0 L-14,-14 L-4,0 L-14,14 Z M26,0 L4,-14 L14,0 L4,14Z" fill="${PAL.red}" stroke="${INK}" stroke-width="2.5"/>`;
export const arrowMarkup = ARROW;

const QUIVER = `<g transform="rotate(-24)">
  <path d="M-8,-150 L10,-196 M6,-150 L28,-192 M20,-150 L46,-186" stroke="${INK}" stroke-width="5"/>
  <path d="M4,-196 L16,-196 L10,-214 Z M22,-192 L34,-192 L28,-210Z M40,-186 L52,-186 L46,-204Z" fill="${PAL.red}" stroke="${INK}" stroke-width="2.5"/>
  <path d="M-24,-150 L46,-150 L40,10 L-18,10 Z" fill="${PAL.red}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
  <path d="M-24,-150 L4,-150 L6,10 L-18,10 Z" fill="url(#ht-deep)" opacity="0.7"/>
  ${'<rect x="-24" y="-140" width="70" height="12" fill="' + PAL.gold + '" stroke="' + INK + '" stroke-width="3"/>'}
  <rect x="-21" y="-20" width="64" height="12" fill="${PAL.gold}" stroke="${INK}" stroke-width="3"/>
</g>`;

// ---------- GADA (mace) ----------
const GADA = `<g>
  <rect x="-7" y="-20" width="14" height="190" rx="5" fill="${PAL.gold}" stroke="${INK}" stroke-width="${SW}"/>
  <rect x="-10" y="150" width="20" height="18" rx="4" fill="${PAL.red}" stroke="${INK}" stroke-width="3"/>
  <ellipse cx="0" cy="-70" rx="58" ry="62" fill="${PAL.gold}" stroke="${INK}" stroke-width="6"/>
  <path d="M-58,-70 C-58,-110 -30,-132 0,-132 C-24,-110 -30,-40 -10,-8 C-38,-14 -58,-40 -58,-70Z" fill="url(#ht-orange)" opacity="0.9"/>
  <path d="M-56,-70 L56,-70 M-40,-112 C-10,-96 10,-96 40,-112 M-40,-28 C-10,-44 10,-44 40,-28" stroke="${INK}" stroke-width="4" fill="none"/>
  <circle cx="0" cy="-70" r="10" fill="${PAL.red}" stroke="${INK}" stroke-width="3"/>
  <path d="M-8,-130 L0,-152 L8,-130Z" fill="${PAL.gold}" stroke="${INK}" stroke-width="3.5"/>
</g>`;

// ---------- GENERIC RIG ----------
/**
 * makeCharacter('rama'|'lakshmana'|'sita'|'hanuman'|'vanara')
 * returns { node, pose(p), setEyes(open), tail? }
 * Coordinate system: feet at (0,0), ~640 units tall, facing +x.
 */
export function makeCharacter(kind, opts = {}) {
  register(kind);
  const cfg = {
    rama: { skin: PAL.ramaSkin, shade: 'ht-skin-b', dhoti: PAL.gold, border: PAL.red, sash: PAL.red, bow: true, quiver: true },
    lakshmana: { skin: PAL.warmSkin, shade: 'ht-skin-w', dhoti: PAL.green, border: PAL.gold, sash: PAL.gold, bow: true, quiver: true },
    sita: { skin: PAL.warmSkin, shade: 'ht-skin-w', sari: PAL.red, border: PAL.gold },
    hanuman: { skin: PAL.hanu, shade: 'ht-skin-h', dhoti: PAL.red, border: PAL.gold, sash: PAL.gold },
    vanara: { skin: PAL.hanu, shade: 'ht-skin-h', dhoti: PAL.red, border: PAL.gold },
  }[kind];
  const isMonkey = kind === 'hanuman' || kind === 'vanara';
  const big = kind === 'hanuman' ? 1.12 : 1;
  const root = g({ class: `char char-${kind}` });
  const body = g();
  root.appendChild(body);

  // geometry
  const hipY = -300, shY = -462;
  const ua = isMonkey ? [17 * big, 13 * big, 108] : [14, 10, 106];
  const fa = isMonkey ? [13 * big, 10 * big, 96] : [10, 8, 94];

  // tail (behind everything)
  let tailInk, tailFill, tailTip;
  if (isMonkey) {
    const tg = g();
    tailInk = el('path', { fill: 'none', stroke: INK, 'stroke-width': 26 * big, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    tailFill = el('path', { fill: 'none', stroke: cfg.skin, 'stroke-width': 15 * big, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    tailTip = el('circle', { r: 15 * big, fill: PAL.hanuShade, stroke: INK, 'stroke-width': 4 });
    tg.append(tailInk, tailFill, tailTip);
    body.appendChild(tg);
  }

  // quiver
  if (cfg.quiver) body.appendChild(g({ transform: `translate(-34 ${shY + 150})` }, QUIVER));

  const mkArm = (front) => {
    const sh = g();
    const upper = g({}, limb(ua[0], ua[1], ua[2], cfg.skin, cfg.shade, band(26, ua[0] + 2)));
    const elbow = g({ transform: `translate(0 ${ua[2]})` });
    const fore = g({}, limb(fa[0], fa[1], fa[2], cfg.skin, cfg.shade, band(fa[2] - 26, fa[1] + 3) +
      `<ellipse cx="2" cy="${fa[2] + 8}" rx="${12 * big}" ry="${15 * big}" fill="${cfg.skin}" stroke="${INK}" stroke-width="4"/>`));
    const hand = g({ transform: `translate(2 ${fa[2] + 8})` });
    elbow.append(fore, hand);
    upper.appendChild(elbow);
    sh.appendChild(upper);
    return { sh, upper, elbow, hand };
  };
  const mkLeg = (front) => {
    const hip = g();
    const L1 = 150, L2 = 140;
    let thighArt, shinArt;
    if (kind === 'sita') {
      thighArt = ''; shinArt = '';
    } else {
      const dh = isMonkey ? cfg.skin : cfg.dhoti;
      const tA = isMonkey ? 24 * big : 30, tB = isMonkey ? 16 * big : 24;
      thighArt = `<path d="${limbPath(tA, tB, L1)}" fill="${dh}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
        <path d="${limbShade(tA, tB, L1)}" fill="url(#${isMonkey ? cfg.shade : 'ht-orange'})" opacity="0.7"/>
        ${isMonkey ? '' : `<path d="M-14,30 C-8,70 -6,110 -10,150 M8,20 C14,60 12,100 6,150" stroke="${INK}" stroke-width="2.5" fill="none" opacity="0.7"/>
        <path d="M${-tB},${L1 - 6} L${tB},${L1 - 6}" stroke="${cfg.border}" stroke-width="9"/>`}`;
      shinArt = limb(isMonkey ? 14 * big : 13, isMonkey ? 10 * big : 9, L2, cfg.skin, cfg.shade, band(L2 - 26, 12)) +
        `<path d="M-12,${L2 - 6} L-14,${L2 + 12} L${isMonkey ? 40 : 36},${L2 + 12} C${isMonkey ? 40 : 36},${L2} 24,${L2 - 6} 8,${L2 - 8} Z" fill="${cfg.skin}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
    }
    const thigh = g({}, thighArt);
    const knee = g({ transform: `translate(0 ${L1})` }, shinArt);
    thigh.appendChild(knee);
    hip.appendChild(thigh);
    return { hip, thigh, knee };
  };

  const armB = mkArm(false);
  const legB = mkLeg(false);
  armB.sh.setAttribute('opacity', '1');
  body.appendChild(armB.sh);
  body.appendChild(legB.hip);

  // torso
  const torso = g();
  if (kind === 'sita') {
    torso.innerHTML = `
      <path class="skirt" d="M-48,-300 C-62,-200 -86,-80 -96,-4 L96,-4 C86,-80 66,-200 50,-300 Z" fill="${cfg.sari}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
      <path d="M-48,-300 C-62,-200 -86,-80 -96,-4 L-30,-4 C-24,-90 -20,-200 -8,-300 Z" fill="url(#ht-deep)" opacity="0.7"/>
      <path d="M-92,-30 L92,-30" stroke="${cfg.border}" stroke-width="16"/>
      <path d="M-94,-22 L94,-22" stroke="${INK}" stroke-width="3" stroke-dasharray="6 10"/>
      <path d="M-20,-290 C-16,-200 -10,-100 -6,-6 M20,-290 C30,-200 42,-100 52,-6" stroke="${INK}" stroke-width="3" fill="none" opacity="0.7"/>
      <path d="M30,-292 C46,-200 62,-110 70,-40 L90,-40 C78,-120 64,-210 54,-296Z" fill="${cfg.border}" stroke="${INK}" stroke-width="3"/>
      <path d="M-14,4 L-16,18 L30,18 C30,8 20,4 8,2Z" fill="${cfg.skin}" stroke="${INK}" stroke-width="4"/>
      <path d="M-40,-300 C-46,-350 -48,-420 -40,-462 C-26,-478 26,-478 40,-462 C48,-420 46,-350 40,-300 Z" fill="${cfg.skin}" stroke="${INK}" stroke-width="${SW}"/>
      <path d="M-42,-440 C-30,-456 30,-456 42,-440 L42,-372 C20,-364 -20,-364 -42,-372 Z" fill="${PAL.cream}" stroke="${INK}" stroke-width="4"/>
      <path d="M-42,-440 L-42,-372 C-30,-368 -20,-366 -10,-366 L-12,-450Z" fill="url(#ht-gold)" opacity="0.8"/>
      <path d="M-46,-470 C-10,-420 30,-360 52,-300 L22,-300 C8,-350 -20,-420 -50,-440 Z" fill="${cfg.sari}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M-46,-470 C-10,-420 30,-360 52,-300" fill="none" stroke="${cfg.border}" stroke-width="7"/>
      <path d="M-24,-458 C-10,-430 14,-430 28,-456" fill="none" stroke="${PAL.gold}" stroke-width="7"/>
      <circle cx="4" cy="-436" r="6" fill="${PAL.red}" stroke="${INK}" stroke-width="2"/>`;
  } else {
    const chest = cfg.skin;
    const wide = isMonkey ? 1.18 * big : 1;
    torso.innerHTML = `
      <path d="M${-40 * wide},-300 C${-48 * wide},-350 ${-52 * wide},-420 ${-44 * wide},-462 C-30,-480 30,-480 ${44 * wide},-462 C${54 * wide},-420 ${48 * wide},-350 ${40 * wide},-300 Z" fill="${chest}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
      <path d="M${-40 * wide},-300 C${-48 * wide},-350 ${-52 * wide},-420 ${-44 * wide},-462 C-34,-472 -20,-476 -8,-476 C-20,-420 -16,-350 -6,-300 Z" fill="url(#${cfg.shade})" opacity="0.8"/>
      ${isMonkey ? `<path d="M-6,-430 C10,-420 24,-420 36,-430 M-4,-380 C10,-372 24,-372 34,-382" stroke="${INK}" stroke-width="3" fill="none" opacity="0.8"/>` : ''}
      <path d="M-34,-464 L40,-300" stroke="${PAL.cream}" stroke-width="5"/>
      <path d="M-30,-456 C-14,-420 18,-420 36,-454" fill="none" stroke="${PAL.gold}" stroke-width="9"/>
      <path d="M-30,-456 C-14,-420 18,-420 36,-454" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="3 8"/>
      <circle cx="4" cy="-426" r="8" fill="${PAL.red}" stroke="${INK}" stroke-width="3"/>
      ${cfg.sash ? `<path d="M-50,-466 C-30,-420 -10,-360 4,-310 L30,-316 C14,-370 -12,-430 -34,-472 Z" fill="${cfg.sash}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M-50,-466 C-30,-420 -10,-360 4,-310 L14,-312 C0,-370 -20,-430 -40,-470Z" fill="url(#${cfg.sash === PAL.red ? 'ht-deep' : 'ht-orange'})" opacity="0.7"/>` : ''}
      <path d="M${-46 * wide},-326 L${46 * wide},-326 L${50 * wide},-292 L${-50 * wide},-292 Z" fill="${cfg.dhoti === PAL.gold ? PAL.red : cfg.dhoti}" stroke="${INK}" stroke-width="4"/>
      <path d="M${-46 * wide},-312 L${46 * wide},-312" stroke="${PAL.gold}" stroke-width="5"/>
      ${isMonkey ? `<path d="M-46,-296 L48,-296 L40,-236 L-40,-236Z" fill="${cfg.dhoti}" stroke="${INK}" stroke-width="4"/><path d="M-44,-246 L42,-246" stroke="${PAL.gold}" stroke-width="6"/>` :
        `<path d="M-50,-296 L50,-296 L56,-240 C20,-226 -20,-226 -54,-240 Z" fill="${cfg.dhoti}" stroke="${INK}" stroke-width="4"/>
         <path d="M14,-296 C18,-260 22,-220 26,-170 L40,-170 C36,-220 34,-260 34,-296 Z" fill="${cfg.dhoti}" stroke="${INK}" stroke-width="3.5"/>
         <path d="M26,-176 L40,-176" stroke="${cfg.border}" stroke-width="7"/>`}`;
  }

  const legF = mkLeg(true);
  const headG = g({ transform: `translate(6 ${shY - 10})` }, kind === 'hanuman' ? hanumanHead(true) : kind === 'vanara' ? hanumanHead(false) : humanHead(kind, cfg.skin, cfg.shade));
  const armF = mkArm(true);

  body.appendChild(legF.hip);
  body.appendChild(torso);
  body.appendChild(headG);
  body.appendChild(armF.sh);

  // positions
  const place = (n, x, y) => n.setAttribute('data-p', `${x},${y}`);
  const shoulderB = [-14, shY + 8], shoulderF = [12, shY + 12];
  const hipB = [-10, hipY], hipF = [10, hipY];

  // props
  let bow = null, arrow = null, bowString = null, gada = null;
  if (cfg.bow) {
    bow = g();
    bow.innerHTML = BOW;
    bowString = el('path', { stroke: INK, 'stroke-width': 3, fill: 'none' });
    bow.insertBefore(bowString, bow.firstChild);
    arrow = g({ style: 'display:none' }, ARROW(300));
    bow.appendChild(arrow);
    armF.hand.appendChild(bow);
  }
  if (kind === 'hanuman') {
    gada = g({}, GADA);
    armF.hand.appendChild(gada);
  }
  const eyeOpen = root.querySelectorAll('.eye-open');
  const eyeClosed = root.querySelectorAll('.eye-closed');
  const brows = root.querySelectorAll('.brow');
  const pupils = root.querySelectorAll('.pupil');

  const st = { ...opts };

  function pose(p = {}) {
    const {
      x = 0, y = 0, s = 1, flip = false, bob = 0, lean = 0, rot = 0,
      armF: aF = [8, -10], armB: aB = [-6, -8], legF: lF = [0, 0], legB: lB = [0, 0],
      head = 0, bowWorld = null, draw = 0, arrowOn = false, eyes = 1, brow = 0, gadaRot = null,
      tail = 0, tailCurl = 1, skirt = 0, look = 0, gadaOn = true, bowOn = true,
    } = p;
    root.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(2)}) scale(${(flip ? -s : s).toFixed(4)} ${s.toFixed(4)})`);
    body.setAttribute('transform', `translate(0 ${bob.toFixed(2)}) rotate(${lean.toFixed(2)} 0 ${hipY})`);
    // forward angle convention: positive = swing forward (towards +x)
    armB.sh.setAttribute('transform', `translate(${shoulderB[0]} ${shoulderB[1]}) rotate(${(-aB[0]).toFixed(2)})`);
    armB.elbow.setAttribute('transform', `translate(0 ${ua[2]}) rotate(${(-aB[1]).toFixed(2)})`);
    armF.sh.setAttribute('transform', `translate(${shoulderF[0]} ${shoulderF[1]}) rotate(${(-aF[0]).toFixed(2)})`);
    armF.elbow.setAttribute('transform', `translate(0 ${ua[2]}) rotate(${(-aF[1]).toFixed(2)})`);
    legB.hip.setAttribute('transform', `translate(${hipB[0]} ${hipB[1]}) rotate(${(-lB[0]).toFixed(2)})`);
    legB.knee.setAttribute('transform', `translate(0 150) rotate(${(lB[1]).toFixed(2)})`);
    legF.hip.setAttribute('transform', `translate(${hipF[0]} ${hipF[1]}) rotate(${(-lF[0]).toFixed(2)})`);
    legF.knee.setAttribute('transform', `translate(0 150) rotate(${(lF[1]).toFixed(2)})`);
    headG.setAttribute('transform', `translate(6 ${shY - 10}) rotate(${(-head).toFixed(2)})`);
    if (kind === 'sita') {
      const sk = torso.querySelector('.skirt');
      torso.setAttribute('transform', `skewX(${(skirt * 6).toFixed(2)})`);
      headG.setAttribute('transform', `translate(6 ${shY - 10}) rotate(${(-head).toFixed(2)})`);
      void sk;
    }
    const open = eyes > 0.5;
    eyeOpen.forEach((n) => (n.style.display = open ? '' : 'none'));
    eyeClosed.forEach((n) => (n.style.display = open ? 'none' : ''));
    brows.forEach((n) => n.setAttribute('transform', `translate(0 ${(-brow * 3).toFixed(1)}) rotate(${(brow * -6).toFixed(1)} 26 -90)`));
    pupils.forEach((n) => n.setAttribute('transform', `translate(${(look * 3).toFixed(1)} 0)`));

    if (bow) {
      const sumArm = -aF[0] - aF[1];
      const bw = bowWorld === null ? 0 : bowWorld;
      bow.setAttribute('transform', `rotate(${(bw - sumArm).toFixed(2)})`);
      bow.style.display = bowOn ? '' : 'none';
      const d = clamp(draw, 0, 1) * 120;
      bowString.setAttribute('d', `M-14,-170 L${(-14 - d).toFixed(1)},0 L-14,170`);
      arrow.style.display = arrowOn ? '' : 'none';
      arrow.setAttribute('transform', `translate(${(-14 - d).toFixed(1)} 0)`);
    }
    if (gada) {
      const sumArm = -aF[0] - aF[1];
      const gw = gadaRot === null ? 20 : gadaRot;
      gada.setAttribute('transform', `rotate(${(gw - sumArm).toFixed(2)}) translate(0 -30)`);
      gada.style.display = gadaOn ? '' : 'none';
    }
    if (tailInk) {
      // secondary animation: tail follows with a delayed sine wave per segment
      const pts = [];
      let px = -40, py = hipY + 20, ang = 200 + tail * 0.6;
      pts.push([px, py]);
      for (let i = 0; i < 9; i++) {
        ang += (12 + 10 * tailCurl) + Math.sin(tail * 0.05 - i * 0.7) * 14;
        const L = 42 * big;
        px += Math.cos((ang * Math.PI) / 180) * L;
        py += Math.sin((ang * Math.PI) / 180) * L;
        pts.push([px, py]);
      }
      let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
        d += ` Q${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)}`;
      }
      const last = pts[pts.length - 1];
      d += ` L${last[0].toFixed(1)},${last[1].toFixed(1)}`;
      tailInk.setAttribute('d', d);
      tailFill.setAttribute('d', d);
      tailTip.setAttribute('cx', last[0].toFixed(1));
      tailTip.setAttribute('cy', last[1].toFixed(1));
    }
  }
  pose({});
  return { node: root, pose, head: headG, kind };
}

// Walk cycle generator (deterministic from phase in radians)
export function walk(phase, { stride = 1, armSwing = 1 } = {}) {
  const s = Math.sin(phase), c = Math.cos(phase);
  const s2 = Math.sin(phase + Math.PI), c2 = Math.cos(phase + Math.PI);
  return {
    legF: [24 * s * stride, 44 * Math.pow(Math.max(0, c), 1.4) * stride + 4],
    legB: [24 * s2 * stride, 44 * Math.pow(Math.max(0, c2), 1.4) * stride + 4],
    armF: [-20 * s * armSwing + 4, -14 - 8 * Math.max(0, -s)],
    armB: [20 * s * armSwing, -14 - 8 * Math.max(0, s)],
    bob: -9 * Math.cos(2 * phase),
    skirt: s * 0.9,
  };
}

// ---------- RAVANA (frontal, ten heads) ----------
function ravanaHead(scale = 1, main = false) {
  const s = scale;
  return `<g transform="scale(${s})">
    <path d="M-30,-92 L-26,-150 L-12,-128 L0,-176 L12,-128 L26,-150 L30,-92 Z" fill="${PAL.gold}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M-30,-92 L-26,-150 L-12,-128 L-4,-100Z" fill="url(#ht-red)" opacity="0.7"/>
    <circle cx="0" cy="-114" r="8" fill="${PAL.red}" stroke="${INK}" stroke-width="3"/>
    <ellipse cx="0" cy="-48" rx="40" ry="50" fill="#D9874A" stroke="${INK}" stroke-width="${SW}"/>
    <path d="M-40,-48 C-40,-80 -24,-98 0,-98 C-18,-80 -22,-30 -8,2 C-28,-4 -40,-24 -40,-48Z" fill="url(#ht-skin-w)" opacity="0.9"/>
    <path d="M-38,-92 C-20,-104 20,-104 38,-92 L38,-80 C20,-90 -20,-90 -38,-80 Z" fill="${PAL.gold}" stroke="${INK}" stroke-width="4"/>
    <path class="rv-brow" d="M-30,-64 L-8,-56 M30,-64 L8,-56" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
    <path d="M-26,-50 Q-16,-58 -6,-50 Q-16,-45 -26,-50Z M26,-50 Q16,-58 6,-50 Q16,-45 26,-50Z" fill="${PAL.cream}" stroke="${INK}" stroke-width="3"/>
    <circle cx="-14" cy="-50" r="4" fill="${PAL.red}"/><circle cx="14" cy="-50" r="4" fill="${PAL.red}"/>
    <path d="M0,-50 L-5,-30 L5,-30" fill="none" stroke="${INK}" stroke-width="3"/>
    <path d="M-4,-22 C-16,-30 -34,-26 -42,-12 C-30,-18 -20,-16 -4,-14 Z M4,-22 C16,-30 34,-26 42,-12 C30,-18 20,-16 4,-14 Z" fill="${INK}"/>
    <path d="M-10,-6 Q0,-2 10,-6" stroke="${PAL.deepRed}" stroke-width="4" fill="none"/>
    <path d="M-6,-84 L0,-72 L6,-84" stroke="${PAL.red}" stroke-width="4" fill="none"/>
    <circle cx="-40" cy="-30" r="8" fill="${PAL.gold}" stroke="${INK}" stroke-width="3"/>
    <circle cx="40" cy="-30" r="8" fill="${PAL.gold}" stroke="${INK}" stroke-width="3"/>
    ${main ? `<path d="M-20,4 C-10,10 10,10 20,4 L14,18 C6,22 -6,22 -14,18Z" fill="${INK}"/>` : ''}
  </g>`;
}

export function makeRavana() {
  register('ravana');
  const root = g({ class: 'char char-ravana' });
  const body = g();
  root.appendChild(body);
  // cape
  body.appendChild(g({}, `<path d="M-130,-520 C-210,-380 -250,-160 -260,0 L260,0 C250,-160 210,-380 130,-520 Z" fill="${PAL.deepRed}" stroke="${INK}" stroke-width="${SW}"/>
    <path d="M-130,-520 C-210,-380 -250,-160 -260,0 L-150,0 C-140,-200 -120,-380 -80,-520Z" fill="url(#ht-ink)" opacity="0.5"/>
    <path d="M-250,-30 L250,-30" stroke="${PAL.gold}" stroke-width="10"/>`));
  // side heads (9) in a fan behind the main head: 4 left, 4 right, 1 crowning top
  const heads = g({ class: 'rv-heads' });
  const slots = [[-240, -610, 0.62], [-180, -640, 0.68], [-120, -665, 0.74], [-62, -690, 0.8], [62, -690, 0.8], [120, -665, 0.74], [180, -640, 0.68], [240, -610, 0.62], [0, -800, 0.7]];
  const headNodes = slots.map(([x, y, s]) => {
    const n = g({ transform: `translate(${x} ${y})` }, ravanaHead(s));
    heads.appendChild(n);
    return { n, x, y, s };
  });
  body.appendChild(heads);
  const mkArm = (side) => {
    const sh = g();
    sh.innerHTML = `<path d="${limbPath(30, 22, 150)}" fill="#D9874A" stroke="${INK}" stroke-width="${SW}"/>
      <path d="${limbShade(30, 22, 150)}" fill="url(#ht-skin-w)" opacity="0.8"/>
      <rect x="-32" y="30" width="64" height="16" rx="4" fill="${PAL.gold}" stroke="${INK}" stroke-width="3"/>`;
    const elbow = g({ transform: 'translate(0 150)' }, `<path d="${limbPath(22, 18, 130)}" fill="#D9874A" stroke="${INK}" stroke-width="${SW}"/>
      <rect x="-24" y="96" width="48" height="20" rx="4" fill="${PAL.gold}" stroke="${INK}" stroke-width="3"/>
      <circle cx="0" cy="146" r="26" fill="#D9874A" stroke="${INK}" stroke-width="4"/>`);
    sh.appendChild(elbow);
    return { sh, elbow };
  };
  const armL = mkArm(-1), armR = mkArm(1);
  // sword in right hand
  const sword = g({ transform: 'translate(0 146)' }, `<rect x="-8" y="-36" width="16" height="46" fill="${PAL.gold}" stroke="${INK}" stroke-width="3"/>
    <path d="M-28,-36 L28,-36" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M-26,-36 L26,-36" stroke="${PAL.gold}" stroke-width="6" stroke-linecap="round"/>
    <path d="M-12,-40 L-10,-300 L0,-330 L10,-300 L12,-40 Z" fill="${PAL.cream}" stroke="${INK}" stroke-width="4"/>
    <path d="M0,-50 L0,-310" stroke="${PAL.skyBlue}" stroke-width="4"/>`);
  armR.elbow.appendChild(sword);
  body.appendChild(armL.sh);
  body.appendChild(armR.sh);
  // torso + armour
  body.appendChild(g({}, `
    <path d="M-120,-0 L-96,-250 L96,-250 L120,0 Z" fill="${PAL.navy}" stroke="${INK}" stroke-width="${SW}"/>
    <path d="M-120,0 L-96,-250 L-30,-250 L-50,0Z" fill="url(#ht-ink)" opacity="0.5"/>
    <path d="M-60,-250 L-70,0 M0,-250 L0,0 M60,-250 L70,0" stroke="${PAL.gold}" stroke-width="6"/>
    <path d="M-110,-60 L110,-60" stroke="${PAL.red}" stroke-width="14"/>
    <path d="M-130,-540 C-150,-470 -130,-320 -100,-250 L100,-250 C130,-320 150,-470 130,-540 C60,-570 -60,-570 -130,-540 Z" fill="${PAL.red}" stroke="${INK}" stroke-width="${SW}"/>
    <path d="M-130,-540 C-150,-470 -130,-320 -100,-250 L-30,-250 C-60,-330 -70,-470 -50,-560 C-90,-556 -110,-550 -130,-540Z" fill="url(#ht-deep)" opacity="0.8"/>
    <path d="M-104,-500 C-50,-420 50,-420 104,-500" fill="none" stroke="${PAL.gold}" stroke-width="16"/>
    <path d="M-104,-500 C-50,-420 50,-420 104,-500" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="4 10"/>
    <circle cx="0" cy="-430" r="20" fill="${PAL.gold}" stroke="${INK}" stroke-width="4"/>
    <circle cx="0" cy="-430" r="9" fill="${PAL.green}"/>
    <path d="M-110,-290 L110,-290 L104,-250 L-104,-250Z" fill="${PAL.gold}" stroke="${INK}" stroke-width="4"/>
    <circle cx="0" cy="-270" r="18" fill="${PAL.red}" stroke="${INK}" stroke-width="4"/>
    <path d="M-150,-560 C-170,-520 -160,-490 -130,-480 L-100,-560 Z M150,-560 C170,-520 160,-490 130,-480 L100,-560Z" fill="${PAL.gold}" stroke="${INK}" stroke-width="4"/>
  `));
  const mainHead = g({ transform: 'translate(0 -560)' }, ravanaHead(1.15, true));
  body.appendChild(mainHead);

  const brows = root.querySelectorAll('.rv-brow');
  function pose(p = {}) {
    const { x = 0, y = 0, s = 1, bob = 0, armL: aL = [14, 10], armR: aR = [-14, -10], spread = 1, heads: hk = 1, rage = 0, rot = 0 } = p;
    root.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(2)}) scale(${s.toFixed(4)})`);
    body.setAttribute('transform', `translate(0 ${bob.toFixed(1)})`);
    armL.sh.setAttribute('transform', `translate(-128 -520) rotate(${aL[0].toFixed(1)})`);
    armL.elbow.setAttribute('transform', `translate(0 150) rotate(${aL[1].toFixed(1)})`);
    armR.sh.setAttribute('transform', `translate(128 -520) rotate(${aR[0].toFixed(1)})`);
    armR.elbow.setAttribute('transform', `translate(0 150) rotate(${aR[1].toFixed(1)})`);
    headNodes.forEach((h, i) => {
      const k = clamp(hk * 1.6 - (Math.abs(i - 3.5) / 4) * 0.6 - (i === 8 ? 0.5 : 0));
      const sx = h.x * spread, sy = -560 + (h.y + 560) * spread;
      h.n.setAttribute('transform', `translate(${lerpN(0, sx, k).toFixed(1)} ${lerpN(-560, sy, k).toFixed(1)})`);
      h.n.setAttribute('opacity', clamp(k * 3).toFixed(2));
    });
    brows.forEach((b) => b.setAttribute('transform', `translate(0 ${(rage * 4).toFixed(1)})`));
  }
  pose({});
  return { node: root, pose, kind: 'ravana' };
}
const lerpN = (a, b, t) => a + (b - a) * t;

// ---------- GOLDEN DEER ----------
export function makeDeer() {
  register('deer');
  const root = g({ class: 'char char-deer' });
  const body = g();
  root.appendChild(body);
  const leg = (x, front) => {
    const hip = g();
    hip.innerHTML = `<path d="${limbPath(15, 8, 90)}" fill="${PAL.gold}" stroke="${INK}" stroke-width="4"/>`;
    const knee = g({ transform: 'translate(0 90)' }, `<path d="${limbPath(7, 5, 86)}" fill="${PAL.gold}" stroke="${INK}" stroke-width="4"/>
      <path d="M-7,82 L-8,100 L10,100 L7,82Z" fill="${INK}"/>`);
    hip.appendChild(knee);
    return { hip, knee, x };
  };
  const legs = [leg(-90, false), leg(70, true), leg(-70, false), leg(90, true)];
  body.appendChild(legs[0].hip);
  body.appendChild(legs[1].hip);
  body.appendChild(g({}, `
    <path d="M-140,-210 C-150,-260 -100,-290 0,-286 C90,-284 130,-270 140,-230 C150,-190 120,-160 60,-156 C0,-150 -90,-150 -120,-170 C-136,-180 -140,-196 -140,-210Z" fill="${PAL.gold}" stroke="${INK}" stroke-width="${SW}"/>
    <path d="M-140,-210 C-136,-180 -100,-160 -20,-154 C60,-150 120,-170 134,-200 C110,-180 40,-176 -20,-180 C-80,-184 -120,-196 -140,-210Z" fill="url(#ht-orange)" opacity="0.9"/>
    <g fill="${PAL.red}" stroke="${INK}" stroke-width="2">
      <circle cx="-80" cy="-240" r="9"/><circle cx="-40" cy="-256" r="8"/><circle cx="0" cy="-236" r="10"/><circle cx="44" cy="-254" r="8"/><circle cx="80" cy="-232" r="9"/><circle cx="-100" cy="-206" r="7"/><circle cx="30" cy="-206" r="7"/>
    </g>
    <path d="M-140,-240 C-170,-262 -176,-238 -160,-222 Z" fill="${PAL.cream}" stroke="${INK}" stroke-width="4"/>
  `));
  const neck = g({ transform: 'translate(110 -260)' }, `
    <path d="M-20,10 C-10,-50 0,-100 20,-130 L60,-118 C40,-90 30,-40 30,10Z" fill="${PAL.gold}" stroke="${INK}" stroke-width="${SW}"/>
    <path d="M-20,10 C-10,-50 0,-100 20,-130 L32,-126 C18,-90 10,-40 6,10Z" fill="url(#ht-orange)" opacity="0.8"/>
    <g transform="translate(36 -136)">
      <path d="M-20,-34 C-50,-90 -40,-130 -60,-160 M-34,-70 C-60,-80 -70,-100 -84,-104 M-44,-110 C-30,-126 -20,-136 -26,-160 M10,-36 C10,-90 30,-120 20,-160 M14,-80 C34,-90 44,-110 50,-126 M20,-120 C6,-134 0,-146 4,-164" stroke="${INK}" stroke-width="11" fill="none" stroke-linecap="round"/>
      <path d="M-20,-34 C-50,-90 -40,-130 -60,-160 M-34,-70 C-60,-80 -70,-100 -84,-104 M-44,-110 C-30,-126 -20,-136 -26,-160 M10,-36 C10,-90 30,-120 20,-160 M14,-80 C34,-90 44,-110 50,-126 M20,-120 C6,-134 0,-146 4,-164" stroke="${PAL.gold}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="M-36,-12 C-40,-46 -4,-56 20,-40 C40,-30 70,-12 76,6 C66,20 40,20 10,16 C-16,14 -34,6 -36,-12Z" fill="${PAL.gold}" stroke="${INK}" stroke-width="${SW}"/>
      <path d="M-22,-36 L-42,-62 L-12,-46Z" fill="${PAL.gold}" stroke="${INK}" stroke-width="3.5"/>
      <ellipse cx="14" cy="-18" rx="8" ry="6" fill="${INK}"/><circle cx="16" cy="-20" r="2.4" fill="${PAL.cream}"/>
      <circle cx="74" cy="4" r="5" fill="${INK}"/>
      <path d="M-10,-54 L-6,-72 L2,-56" fill="${PAL.red}" stroke="${INK}" stroke-width="2"/>
    </g>`);
  body.appendChild(neck);
  body.appendChild(legs[2].hip);
  body.appendChild(legs[3].hip);
  function pose(p = {}) {
    const { x = 0, y = 0, s = 1, flip = false, phase = 0, gallop = 1, rot = 0, neck: nk = 0 } = p;
    root.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(2)}) scale(${(flip ? -s : s).toFixed(4)} ${s.toFixed(4)})`);
    const sp = Math.sin(phase);
    body.setAttribute('transform', `translate(0 ${(-Math.abs(Math.sin(phase)) * 20 * gallop).toFixed(1)}) rotate(${(-sp * 6 * gallop).toFixed(2)} 0 -220)`);
    neck.setAttribute('transform', `translate(110 -260) rotate(${(nk + sp * 6 * gallop).toFixed(2)})`);
    legs.forEach((l, i) => {
      const fr = i % 2 === 1;
      const ph = phase + (i > 1 ? 0.5 : 0);
      const a = fr ? 40 * Math.sin(ph) * gallop + (gallop * 20) : 40 * Math.sin(ph + Math.PI) * gallop - gallop * 25;
      const k = fr ? 40 * Math.max(0, Math.cos(ph)) * gallop : -30 * Math.max(0, Math.cos(ph + Math.PI)) * gallop;
      l.hip.setAttribute('transform', `translate(${l.x} -190) rotate(${(-a).toFixed(1)})`);
      l.knee.setAttribute('transform', `translate(0 90) rotate(${k.toFixed(1)})`);
    });
  }
  pose({});
  return { node: root, pose, kind: 'deer' };
}

// ---------- PUSHPAKA VIMANA ----------
export function makeVimana() {
  register('vimana');
  const root = g({ class: 'prop-vimana' });
  root.innerHTML = `
    <path d="M-330,-20 C-300,40 300,40 360,-40 L300,-60 L-280,-60 Z" fill="${PAL.gold}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M-330,-20 C-300,40 300,40 360,-40 L320,-30 C220,10 -220,14 -320,-30Z" fill="url(#ht-orange)" opacity="0.9"/>
    <path d="M-290,-40 L330,-40" stroke="${PAL.red}" stroke-width="12"/>
    <path d="M-290,-40 L330,-40" stroke="${INK}" stroke-width="3" stroke-dasharray="6 12"/>
    <path d="M360,-40 C420,-60 440,-110 410,-140 C440,-100 400,-80 360,-70Z" fill="${PAL.gold}" stroke="${INK}" stroke-width="5"/>
    <path d="M-260,-60 L-240,-250 L240,-250 L260,-60 Z" fill="none"/>
    <path d="M-230,-60 L-230,-230 M-80,-60 L-80,-250 M80,-60 L80,-250 M230,-60 L230,-230" stroke="${INK}" stroke-width="12"/>
    <path d="M-230,-60 L-230,-230 M-80,-60 L-80,-250 M80,-60 L80,-250 M230,-60 L230,-230" stroke="${PAL.gold}" stroke-width="5"/>
    <path d="M-280,-220 C-200,-300 -100,-340 0,-420 C100,-340 200,-300 280,-220 Z" fill="${PAL.red}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M-280,-220 C-200,-300 -100,-340 0,-420 C-40,-330 -60,-270 -60,-220Z" fill="url(#ht-deep)" opacity="0.8"/>
    <path d="M-280,-220 L280,-220" stroke="${PAL.gold}" stroke-width="14"/>
    <path d="M0,-420 L0,-470" stroke="${INK}" stroke-width="6"/><path d="M0,-470 L44,-456 L0,-440Z" fill="${PAL.gold}" stroke="${INK}" stroke-width="3"/>
    <g fill="${PAL.gold}" stroke="${INK}" stroke-width="3"><circle cx="-160" cy="-264" r="10"/><circle cx="0" cy="-300" r="12"/><circle cx="160" cy="-264" r="10"/></g>
    <g class="wing" transform="translate(-200 -60)">
      <path d="M0,0 C-120,-40 -230,-140 -260,-250 C-200,-200 -150,-180 -80,-170 C-150,-140 -140,-100 -60,-80 Z" fill="${PAL.cream}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M0,0 C-80,-30 -160,-90 -200,-160 C-120,-110 -80,-80 -30,-40Z" fill="url(#ht-gold)" opacity="0.9"/>
    </g>`;
  return { node: root, kind: 'vimana' };
}

// ---------- VANARA silhouettes / warrior silhouettes ----------
export function warriorSilhouette(seed, color = PAL.navy) {
  const r = (n) => ((Math.sin(seed * 91.7 + n * 13.3) + 1) / 2);
  const h = 280 + r(1) * 90;
  const lean = (r(2) - 0.5) * 16;
  const spear = r(3) > 0.4;
  const flag = r(4) > 0.7;
  return `<g transform="rotate(${lean.toFixed(1)})">
    <path d="M-34,0 L-20,${-h * 0.45} L-30,${-h * 0.78} C-24,${-h * 0.86} 24,${-h * 0.86} 30,${-h * 0.78} L20,${-h * 0.45} L34,0 L10,0 L0,${-h * 0.3} L-10,0Z" fill="${color}"/>
    <circle cx="0" cy="${-h * 0.9}" r="${h * 0.075}" fill="${color}"/>
    <path d="M-12,${-h * 0.96} L0,${-h * 1.08} L12,${-h * 0.96}Z" fill="${color}"/>
    ${spear ? `<path d="M26,${-h * 0.7} L60,${-h * 1.35}" stroke="${color}" stroke-width="9"/><path d="M52,${-h * 1.32} L72,${-h * 1.48} L66,${-h * 1.28}Z" fill="${color}"/>` : `<path d="M-28,${-h * 0.72} L-70,${-h * 0.4}" stroke="${color}" stroke-width="12" stroke-linecap="round"/><circle cx="34" cy="${-h * 0.6}" r="${h * 0.12}" fill="${color}"/>`}
    ${flag ? `<path d="M-30,${-h * 0.7} L-34,${-h * 1.6}" stroke="${color}" stroke-width="7"/><path d="M-34,${-h * 1.6} L36,${-h * 1.5} L-32,${-h * 1.36}Z" fill="${color}"/>` : ''}
  </g>`;
}

export function vanaraCarrier(seed) {
  // simplified vanara silhouette holding a stone overhead
  const lean = ((seed * 37) % 11) - 5;
  return `<g transform="rotate(${lean})">
    <path d="M-40,-180 C-60,-120 -60,-60 -30,0 L-10,0 L0,-60 L10,0 L30,0 C56,-60 60,-130 40,-180 Z" fill="${PAL.hanu}" stroke="${INK}" stroke-width="5"/>
    <path d="M-40,-180 C-60,-120 -60,-60 -30,0 L-14,0 C-30,-70 -26,-130 -10,-180Z" fill="url(#ht-skin-h)" opacity="0.8"/>
    <path d="M-44,-100 L44,-100 L40,-70 L-40,-70Z" fill="${PAL.red}" stroke="${INK}" stroke-width="4"/>
    <circle cx="0" cy="-214" r="36" fill="${PAL.hanu}" stroke="${INK}" stroke-width="5"/>
    <path d="M6,-218 C22,-228 44,-222 46,-206 C48,-190 30,-184 14,-186 C4,-188 0,-200 6,-218Z" fill="${MUZZLE}" stroke="${INK}" stroke-width="4"/>
    <circle cx="16" cy="-226" r="4" fill="${INK}"/>
    <path d="M-36,-170 L-60,-260 M36,-170 L60,-260" stroke="${INK}" stroke-width="22" stroke-linecap="round"/>
    <path d="M-36,-170 L-60,-260 M36,-170 L60,-260" stroke="${PAL.hanu}" stroke-width="13" stroke-linecap="round"/>
    <path d="M-40,-60 C-90,-40 -110,-100 -80,-130" stroke="${INK}" stroke-width="14" fill="none" stroke-linecap="round"/>
    <path d="M-40,-60 C-90,-40 -110,-100 -80,-130" stroke="${PAL.hanu}" stroke-width="7" fill="none" stroke-linecap="round"/>
  </g>`;
}
