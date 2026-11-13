// SCENE 05 — 00:23–00:29 HANUMAN'S DEVOTION
import { PAL, W, H, tw, ease, clamp, onTwos, el, frag, track } from '../core/util.js';
import { headline, animateWords, halftoneField, kicker } from '../core/textures.js';
import { makeCharacter } from '../assets/characters.js';
import { mountains, ground, burst, bush, cloud, frondPlant } from '../assets/environments.js';
import { stage, place, shake } from './kit.js';
import { drawBurstParticles } from '../core/overlay.js';

export default {
  id: 's05', title: "Hanuman's Devotion", start: 23, end: 29, transition: 'iris',
  build({ addHit }) {
    const st = stage(PAL.cream);
    st.layer(halftoneField({ pattern: 'ht-blue', mask: 'm-fadeDown', opacity: 0.6, h: 1200 }));
    const burstG = st.layer(burst(26, 1500, PAL.gold) + `<circle r="330" fill="${PAL.gold}" stroke="${PAL.ink}" stroke-width="8"/><circle r="330" fill="url(#ht-orange)" mask="url(#m-vign)"/><circle r="372" fill="none" stroke="${PAL.red}" stroke-width="12" stroke-dasharray="4 20"/>`);
    const cl = st.layer(`<g transform="translate(-300 0)">${cloud(280)}</g><g transform="translate(380 -140)">${cloud(220)}</g>`);
    const far = st.layer(mountains(PAL.skyBlue, PAL.cream, 2200, 700, 12));
    const mid = st.layer(mountains(PAL.olive, '#A9B66A', 2200, 420, 19));
    const groundG = st.layer(ground(PAL.green, 2600, 700, 'ht-ink') + `<path d="M-1300,4 L1300,4" stroke="${PAL.gold}" stroke-width="8"/>`);
    const lyingGada = st.layer(`<g transform="rotate(-80)"><rect x="-7" y="-20" width="14" height="190" rx="5" fill="${PAL.gold}" stroke="${PAL.ink}" stroke-width="5"/>
      <ellipse cx="0" cy="-70" rx="58" ry="62" fill="${PAL.gold}" stroke="${PAL.ink}" stroke-width="6"/>
      <path d="M-56,-70 L56,-70" stroke="${PAL.ink}" stroke-width="4"/><circle cx="0" cy="-70" r="10" fill="${PAL.red}" stroke="${PAL.ink}" stroke-width="3"/></g>`);
    const rama = makeCharacter('rama');
    const hanu = makeCharacter('hanuman');
    st.layer(rama.node);
    const hanuWrap = st.layer(el('g'));
    hanuWrap.appendChild(hanu.node);
    const fg = st.layer(`<g transform="translate(-380 0)">${frondPlant(380)}</g><g transform="translate(440 0)">${frondPlant(320, PAL.green, '#A9B66A')}</g><g transform="translate(0 40)">${bush(1300, 150, '#1B4A2D', PAL.green)}</g>`);

    const l1 = headline('AN UNBREAKABLE', { size: 128, fill: PAL.cream });
    const l2 = headline('BOND', { size: 300, fill: PAL.gold, plate: PAL.red, sw: 10, dx: 14, dy: 14 });
    const kick = kicker('BHAKTI · DEVOTION', { size: 36, bg: PAL.blue });
    st.top.append(kick.node, l1.node, l2.node);
    addHit(1.1, 'Hanuman lands (thud)');
    addHit(2.0, 'golden burst');
    addHit(2.3, '"BOND" slam');

    return {
      node: st.root,
      faces: [rama.head, hanu.head],
      texts: [l1.node, l2.node],
      update(lt) {
        const [sx, sy] = shake(lt, 1.1, 30, 0.45);
        const cs = track(lt, [[0, 1.08], [1.1, 1.08], [1.3, 1.0, ease.outExpo], [6, 1.04, ease.linear]]);
        st.camera({ s: cs, fx: W / 2, fy: 1350, sy: 1350, shakeX: sx, shakeY: sy });
        const bk = tw(lt, 1.9, 2.5, 0, 1, ease.outBack);
        burstG.setAttribute('transform', `translate(540 1150) rotate(${(lt * 9).toFixed(2)}) scale(${Math.max(0.001, bk).toFixed(3)})`);
        place(cl, 540 - lt * 12, 800);
        place(far, 540 - lt * 6, 1500);
        place(mid, 540 - lt * 12, 1560);
        place(groundG, 540, 1560);
        place(fg, 540 - lt * 30, 1960);

        const sl = onTwos(lt, 15);
        // Hanuman: powerful jump in from top-right, land, kneel in anjali
        let hp;
        if (lt < 1.1) {
          const k = clamp((lt - 0.1) / 1.0);
          const x = 1350 - k * 600, y = 650 + k * 1110 - Math.sin(k * Math.PI) * 380;
          hp = { x, y, s: 0.82, flip: true, rot: -30 + k * 30, armF: [160, 10], armB: [140, 20], legF: [50, 70], legB: [10, 90], tail: sl * 160, tailCurl: 0.2, gadaRot: 40 };
        } else if (lt < 1.6) {
          const k = clamp((lt - 1.1) / 0.5);
          const crouch = Math.sin(k * Math.PI) * 1;
          hp = { x: 750, y: 1760, s: 0.82, flip: true, armF: [40, 30], armB: [30, 20], legF: [40 * crouch, 60 * crouch], legB: [10, 60 * crouch], bob: 60 * crouch, tail: sl * 100, gadaRot: 10 };
        } else {
          const k = tw(lt, 1.6, 2.2, 0, 1, ease.outCubic);
          hp = {
            x: 750, y: 1760, s: 0.82, flip: true, bob: 130 * k, lean: 6 * k,
            legF: [80 * k, 85 * k], legB: [12 * k, 100 * k],
            armF: [10 + 40 * k, 20 + 95 * k], armB: [10 + 36 * k, 20 + 100 * k],
            gadaOn: k < 0.5, head: -6 * k, eyes: lt > 2.4 && lt < 4.6 ? 0 : 1, tail: sl * 60, tailCurl: 1.4,
          };
        }
        hanu.pose(hp);
        // squash on landing
        const sq = lt > 1.1 && lt < 1.35 ? Math.sin(((lt - 1.1) / 0.25) * Math.PI) * 0.08 : 0;
        hanuWrap.setAttribute('transform', `translate(750 1760) scale(${(1 + sq).toFixed(3)} ${(1 - sq).toFixed(3)}) translate(-750 -1760)`);
        lyingGada.setAttribute('transform', `translate(905 1745) scale(0.82)`);
        lyingGada.setAttribute('opacity', lt > 1.9 ? '1' : '0');

        const bless = tw(lt, 2.6, 3.1, 0, 1, ease.outBack);
        rama.pose({ x: 330, y: 1760, s: 0.86, armF: [12 + bless * 58, -30 - bless * 40], armB: [-8, -10], bowWorld: bless * 10, bowOn: true, head: -4 * bless, look: 1, eyes: 1 });

        kick.node.setAttribute('transform', `translate(540 ${tw(lt, 0.3, 0.7, 100, 200, ease.outCubic)})`);
        kick.node.setAttribute('opacity', clamp((lt - 0.3) * 4));
        l1.node.setAttribute('transform', 'translate(540 370)');
        animateWords(l1, lt, 1.4, { mode: 'rise', dur: 0.35, stagger: 0.12 });
        l2.node.setAttribute('transform', 'translate(540 640)');
        animateWords(l2, lt, 2.25, { mode: 'slam', dur: 0.3, from: 3 });
      },
      particles(lt) {
        return [
          { seed: 51, count: 40, color: PAL.gold, area: [0, 500, W, 1300], rise: 70, drift: 30, size: [3, 7], local: lt, alpha: clamp((lt - 1.9) * 2) },
          { seed: 52, count: 12, color: PAL.red, area: [100, 500, 880, 1200], rise: 40, drift: 40, size: [9, 14], shape: 'petal', local: lt, alpha: clamp((lt - 2.2) * 2), spin: 1.5 },
        ];
      },
      overlay(ctx, lt) {
        drawBurstParticles(ctx, { x: 750, y: 1760, k: (lt - 1.1) / 0.5, seed: 5, count: 24, color: PAL.cream, R: 360 });
        drawBurstParticles(ctx, { x: 540, y: 1150, k: (lt - 1.95) / 0.8, seed: 6, count: 40, color: PAL.gold, R: 800 });
      },
    };
  },
};
