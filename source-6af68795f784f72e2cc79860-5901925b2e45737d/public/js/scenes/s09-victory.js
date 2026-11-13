// SCENE 09 — 00:47–00:52 THE VICTORY OF DHARMA
// Rama draws and looses the final arrow → bright graphic trail → impact FREEZE-FRAME →
// golden radial explosion → Ravana falls → deep navy dissolves into warm cream.
import { PAL, W, H, tw, ease, clamp, el, frag } from '../core/util.js';
import { headline, animateWords, halftoneField, underline } from '../core/textures.js';
import { makeCharacter, makeRavana, arrowMarkup } from '../assets/characters.js';
import { burst, impact, ground, skyline } from '../assets/environments.js';
import { stage, place, shake, hexLerp, vis } from './kit.js';
import { drawBurstParticles } from '../core/overlay.js';

const RELEASE = 1.0; // arrow leaves the bow
const HIT = 1.42; // arrow strikes
const FREEZE = 0.45; // freeze-frame hold
const BLAST = HIT + FREEZE; // golden explosion begins
const FROM = [470, 1385]; // arrow start (bow)
const TO = [835, 1440]; // Ravana's heart

export default {
  id: 's09', title: 'The Victory of Dharma', start: 47, end: 52, transition: 'bars',
  build({ addHit }) {
    const st = stage(PAL.navy);
    const sky = st.layer(halftoneField({ pattern: 'ht-blue', mask: 'm-fadeDown', opacity: 0.75, h: 1400 }));
    const warm = st.layer(`<rect x="-300" y="-300" width="${W + 600}" height="${H + 600}" fill="${PAL.cream}"/>`);
    const warmDots = st.layer(halftoneField({ pattern: 'ht-gold', mask: 'm-fadeUp', opacity: 0.9, y: 500, h: 1500 }));
    // depth: far Lanka skyline, mid ridge, ground
    const far = st.layer(skyline(PAL.blue, 21, 2200, 0) + `<rect x="-1100" y="-4" width="2200" height="300" fill="${PAL.blue}"/>`);
    const mid = st.layer(`<path d="M-1200,0 C-900,-160 -600,-60 -300,-140 C0,-220 300,-80 600,-170 C900,-240 1100,-90 1200,-60 L1200,400 L-1200,400Z" fill="${PAL.ink}" opacity="0.85"/>`);
    const groundG = st.layer(ground(PAL.ink, 3000, 900, 'ht-navy') + `<path d="M-1500,6 L1500,6" stroke="${PAL.gold}" stroke-width="8"/>`);
    const blast = st.layer(`${burst(30, 1900, PAL.gold, 0)}<circle r="300" fill="${PAL.gold}" stroke="${PAL.ink}" stroke-width="10"/><circle r="300" fill="url(#ht-orange)" mask="url(#m-vign)"/><circle r="350" fill="none" stroke="${PAL.red}" stroke-width="14" stroke-dasharray="4 22"/>`);
    const rav = makeRavana();
    const ravG = st.layer(el('g'));
    ravG.appendChild(rav.node);
    const rama = makeCharacter('rama');
    const ramaG = st.layer(rama.node);
    const halo = el('g');
    halo.innerHTML = `${burst(18, 520, PAL.gold, 330)}<circle r="300" fill="none" stroke="${PAL.gold}" stroke-width="10" stroke-dasharray="3 18"/>`;
    ramaG.insertBefore(halo, ramaG.firstChild);

    // arrow + trail
    const trail = st.layer(el('g'));
    const trailOuter = el('path', { fill: 'none', stroke: PAL.ink, 'stroke-width': 58, 'stroke-linecap': 'round' });
    const trailGold = el('path', { fill: 'none', stroke: PAL.gold, 'stroke-width': 40, 'stroke-linecap': 'round' });
    const trailCore = el('path', { fill: 'none', stroke: PAL.cream, 'stroke-width': 14, 'stroke-linecap': 'round' });
    const trailDots = el('path', { fill: 'none', stroke: PAL.red, 'stroke-width': 6, 'stroke-dasharray': '2 26', 'stroke-linecap': 'round' });
    trail.append(trailOuter, trailGold, trailCore, trailDots);
    const arrow = st.layer(frag(arrowMarkup(240)));
    const hitStar = st.layer(frag(impact(260, PAL.cream)));

    // Freeze-frame treatment (screen space): duotone wash, frame brackets, label
    const freeze = el('g');
    freeze.innerHTML = `<rect width="${W}" height="${H}" fill="${PAL.red}" opacity="0.28"/>
      <rect width="${W}" height="${H}" fill="url(#ht-navy-lg)" opacity="0.35"/>
      <path d="M60,200 L60,60 L200,60 M880,60 L1020,60 L1020,200 M1020,1720 L1020,1860 L880,1860 M200,1860 L60,1860 L60,1720" stroke="${PAL.cream}" stroke-width="14" fill="none"/>
      <g transform="translate(540 1760)"><rect x="-150" y="-36" width="300" height="60" fill="${PAL.ink}"/><text class="t-sub" font-size="32" letter-spacing="8" text-anchor="middle" y="6" fill="${PAL.gold}">◼ FREEZE</text></g>`;
    st.top.appendChild(freeze);
    const whiteout = el('rect', { width: W, height: H, fill: PAL.cream });
    st.top.appendChild(whiteout);

    const l1 = headline('DHARMA', { size: 250, fill: PAL.red, plate: PAL.gold, sw: 10, dx: 14, dy: 14 });
    const l2 = headline('PREVAILS', { size: 200, fill: PAL.gold, sw: 9 });
    const ul = underline(l2.width * 0.92, { color: PAL.blue, thickness: 22 });
    st.top.append(l1.node, ul.node, l2.node);

    addHit(0.15, 'bow creak / draw');
    addHit(RELEASE, 'arrow release');
    addHit(HIT, 'impact — freeze');
    addHit(BLAST, 'golden explosion');
    addHit(2.3, '"DHARMA" slam');
    addHit(2.6, '"PREVAILS" rise');

    const bez = (k) => {
      // gentle arc from bow to Ravana
      const cx = (FROM[0] + TO[0]) / 2, cy = Math.min(FROM[1], TO[1]) - 90;
      const x = (1 - k) * (1 - k) * FROM[0] + 2 * (1 - k) * k * cx + k * k * TO[0];
      const y = (1 - k) * (1 - k) * FROM[1] + 2 * (1 - k) * k * cy + k * k * TO[1];
      const dx = 2 * (1 - k) * (cx - FROM[0]) + 2 * k * (TO[0] - cx);
      const dy = 2 * (1 - k) * (cy - FROM[1]) + 2 * k * (TO[1] - cy);
      return [x, y, (Math.atan2(dy, dx) * 180) / Math.PI];
    };
    const path = (k0, k1) => {
      let d = '';
      for (let i = 0; i <= 16; i++) {
        const [x, y] = bez(k0 + ((k1 - k0) * i) / 16);
        d += `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)} `;
      }
      return d;
    };

    return {
      node: st.root,
      faces: [rama.head],
      texts: [l1.node, l2.node],
      update(lt) {
        // During the freeze every motion uses the frozen clock (true freeze-frame).
        const frozen = lt >= HIT && lt < BLAST;
        const ft = frozen ? HIT : lt;
        const [sx, sy] = frozen ? [0, 0] : shake(lt, BLAST, 34, 0.6);
        const cs = ft < HIT ? 1.18 + ft * 0.08 : tw(ft, BLAST, BLAST + 0.7, 1.32, 1.0, ease.outExpo) + (ft - BLAST) * 0.015;
        st.camera({ fx: ft < HIT ? 560 + ft * 60 : 600, fy: 1430, s: cs, sy: H * 0.62, shakeX: sx, shakeY: sy });

        // navy → cream
        const day = tw(ft, BLAST + 0.2, BLAST + 1.1, 0, 1, ease.inOutCubic);
        warm.setAttribute('opacity', day.toFixed(3));
        warmDots.setAttribute('opacity', (day * 0.9).toFixed(3));
        sky.setAttribute('opacity', (0.75 * (1 - day)).toFixed(3));
        place(far, 560 - ft * 8, 1500);
        far.setAttribute('opacity', (1 - day * 0.6).toFixed(3));
        place(mid, 560 - ft * 16, 1640);
        mid.setAttribute('opacity', (1 - day * 0.75).toFixed(3));
        place(groundG, 560, 1820);
        groundG.firstElementChild.setAttribute('fill', hexLerp(PAL.ink, PAL.olive, day));

        // golden radial explosion from the point of impact
        const bk = tw(ft, BLAST, BLAST + 0.55, 0.001, 1, ease.outExpo);
        blast.setAttribute('transform', `translate(${TO[0]} ${TO[1] - 60}) rotate(${(ft * 14).toFixed(1)}) scale(${bk.toFixed(3)})`);
        blast.setAttribute('opacity', ft < BLAST ? 0 : 1);

        // RAMA: draw → release → hold → lower the bow, calm
        const draw = ft < RELEASE ? tw(ft, 0.1, 0.85, 0, 1, ease.outCubic) : 0;
        const relax = tw(ft, BLAST + 1.0, BLAST + 1.6, 0, 1, ease.inOutCubic);
        const recoil = ft >= RELEASE ? Math.exp(-(ft - RELEASE) * 9) * Math.sin((ft - RELEASE) * 40) * 3 : 0;
        rama.pose({
          x: 300, y: 1830, s: 0.92,
          armF: [86 - relax * 70 + recoil, 2 - relax * 30], armB: [70 + draw * 12 - relax * 70, -110 - draw * 14 + relax * 110],
          bowWorld: -4 + relax * 4, draw, arrowOn: ft < RELEASE && draw > 0.02, lean: 4 - relax * 4, head: -2 + relax * 4,
          brow: 0.8 * (1 - relax), eyes: 1, look: 1, legF: [16 * (1 - relax), 4], legB: [-14 * (1 - relax), 8],
        });
        halo.setAttribute('transform', `translate(0 -470) rotate(${(ft * 10).toFixed(1)}) scale(${(day * 1).toFixed(3)})`);
        halo.setAttribute('opacity', day.toFixed(3));

        // RAVANA: struck → topples back and sinks; heads fold in
        const fall = tw(ft, BLAST + 0.05, BLAST + 1.25, 0, 1, ease.inCubic);
        const recoilR = ft >= HIT ? 1 : 0;
        rav.pose({
          x: 0, y: 0, s: 0.82, heads: 1 - fall * 0.9, spread: 1.05 - fall * 0.5, rage: 1 - recoilR, bob: 0,
          armL: [30 + recoilR * 50 + fall * 40, 30 + recoilR * 30], armR: [-50 - recoilR * 50 - fall * 30, -40],
        });
        ravG.setAttribute('transform', `translate(${(830 + fall * 120).toFixed(1)} ${(1900 + fall * 160).toFixed(1)}) rotate(${(recoilR * 6 + fall * 74).toFixed(2)})`);
        ravG.setAttribute('opacity', (1 - tw(ft, BLAST + 0.8, BLAST + 1.4, 0, 1)).toFixed(3));

        // arrow flight + trail
        const ak = clamp((ft - RELEASE) / (HIT - RELEASE));
        const flying = ft >= RELEASE && ft < BLAST;
        vis(arrow, flying);
        vis(trail, ft >= RELEASE && ft < BLAST + 0.35);
        if (ft >= RELEASE) {
          const [ax, ay, ang] = bez(ease.inQuad(ak));
          arrow.setAttribute('transform', `translate(${ax.toFixed(1)} ${ay.toFixed(1)}) rotate(${ang.toFixed(1)}) translate(-240 0)`);
          const tail = clamp(ease.inQuad(ak) - 0.55);
          const fade = ft > BLAST ? 1 - (ft - BLAST) / 0.35 : 1;
          const d = path(ft > BLAST ? clamp(tail + (ft - BLAST) * 2) : tail, Math.max(0.001, ease.inQuad(ak) - 0.04));
          [trailOuter, trailGold, trailCore, trailDots].forEach((p) => p.setAttribute('d', d));
          trail.setAttribute('opacity', clamp(fade).toFixed(3));
        }
        const hk = clamp((ft - HIT) / 0.12);
        hitStar.setAttribute('transform', `translate(${TO[0]} ${TO[1]}) rotate(${(hk * 18).toFixed(1)}) scale(${(ease.outBack(hk) * (ft >= BLAST ? 1 + (lt - BLAST) * 3 : 1)).toFixed(3)})`);
        hitStar.setAttribute('opacity', ft < HIT ? 0 : ft < BLAST ? 1 : clamp(1 - (lt - BLAST) / 0.25).toFixed(3));

        vis(freeze, frozen);
        whiteout.setAttribute('opacity', (lt >= BLAST && lt < BLAST + 0.25 ? 1 - (lt - BLAST) / 0.25 : 0).toFixed(3));

        // typography (top third, clear of Rama's face)
        l1.node.setAttribute('transform', 'translate(540 420)');
        animateWords(l1, lt, 2.3, { mode: 'slam', dur: 0.28, from: 3.2 });
        l2.node.setAttribute('transform', 'translate(540 640)');
        animateWords(l2, lt, 2.6, { mode: 'rise', dur: 0.35 });
        ul.node.setAttribute('transform', 'translate(550 690)');
        ul.set(tw(lt, 3.0, 3.5, 0, 1));
      },
      particles(lt) {
        // particles hold still during the freeze-frame
        if (lt >= HIT && lt < BLAST) lt = HIT;
        const day = tw(lt, BLAST + 0.2, BLAST + 1.1, 0, 1);
        return [
          { seed: 91, count: 30, color: PAL.cream, area: [0, 200, W, 1500], rise: 30, drift: 20, size: [2, 4], local: lt, alpha: 0.7 * (1 - day) },
          { seed: 92, count: 60, color: PAL.gold, area: [0, 200, W, 1700], rise: 80, drift: 40, size: [4, 9], local: lt, alpha: day },
          { seed: 93, count: 16, color: PAL.gold, area: [0, 300, W, 1400], rise: 50, drift: 30, size: [10, 18], shape: 'spark', local: lt, alpha: day },
        ];
      },
      overlay(ctx, lt) {
        if (lt >= HIT && lt < BLAST) return;
        drawBurstParticles(ctx, { x: 640, y: 1180, k: (lt - BLAST) / 0.9, seed: 95, count: 60, color: PAL.gold, R: 1100 });
        drawBurstParticles(ctx, { x: 640, y: 1180, k: (lt - BLAST - 0.1) / 0.7, seed: 96, count: 30, color: PAL.red, R: 700 });
      },
    };
  },
};
