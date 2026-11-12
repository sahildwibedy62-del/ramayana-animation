// SCENE 02 — 00:05–00:11 THE EXILE
import { PAL, W, H, tw, ease, clamp, onTwos } from '../core/util.js';
import { headline, animateWords, halftoneField, kicker } from '../core/textures.js';
import { makeCharacter, walk } from '../assets/characters.js';
import { tree, bush, ground, skyline, sun } from '../assets/environments.js';
import { stage, place } from './kit.js';

export default {
  id: 's02', title: 'The Exile', start: 5, end: 11, transition: 'whip',
  build({ addHit }) {
    const st = stage(PAL.gold);
    st.layer(halftoneField({ pattern: 'ht-orange', mask: 'm-fadeDown', opacity: 0.8, h: 1100 }));
    const sunG = st.layer(sun(180, { rays: 18 }));
    const palSil = st.layer(skyline(PAL.navy, 21, 2200, 0));
    // far trees (flat olive), mid trees (green), near trees (dark) — 3 parallax layers + ground
    let farM = '', midM = '', nearM = '';
    for (let i = 0; i < 10; i++) farM += `<g transform="translate(${i * 330} 0) scale(0.55)">${tree({ seed: 30 + i, leaf: PAL.olive, light: '#A9B66A', trunk: PAL.green, dots: 'ht-green' })}</g>`;
    for (let i = 0; i < 9; i++) midM += `<g transform="translate(${i * 460 + 120} 0) scale(${0.85 + (i % 3) * 0.1})">${tree({ seed: 50 + i })}</g>`;
    for (let i = 0; i < 6; i++) nearM += `<g transform="translate(${i * 1000} 0) scale(1.9)">${tree({ seed: 70 + i, leaf: '#1B4A2D', light: PAL.green, dots: 'ht-ink' })}</g>`;
    const far = st.layer(farM + `<rect x="-200" y="-2" width="4000" height="300" fill="${PAL.olive}"/>`);
    const mid = st.layer(midM);
    const groundG = st.layer(ground(PAL.olive, 6000, 600, 'ht-green') + `<path d="M-3000,6 L3000,6" stroke="${PAL.gold}" stroke-width="8" stroke-dasharray="40 30"/>`);
    const lak = makeCharacter('lakshmana');
    const sita = makeCharacter('sita');
    const rama = makeCharacter('rama');
    st.layer(lak.node); st.layer(sita.node); st.layer(rama.node);
    const near = st.layer(nearM);
    let bushes = '';
    for (let i = 0; i < 10; i++) bushes += `<g transform="translate(${i * 520} 0)">${bush(340, 90 + i, '#1B4A2D', PAL.green)}</g>`;
    const nearB = st.layer(bushes);

    const kick = kicker('VANVAAS · THE FOREST YEARS', { size: 34, bg: PAL.green });
    const l1 = headline('14 YEARS', { size: 236, fill: PAL.cream, sw: 9 });
    const l2 = headline('IN EXILE', { size: 176, fill: PAL.red, plate: PAL.navy, sw: 8 });
    st.top.append(kick.node, l1.node, l2.node);
    addHit(0.5, 'text rise "14 YEARS"');
    addHit(0.8, 'text rise "IN EXILE"');

    return {
      node: st.root,
      faces: [rama.head, sita.head, lak.head],
      texts: [l1.node, l2.node, kick.node],
      update(lt) {
        // camera follows the trio; world travels left
        const travel = lt * 260;
        st.camera({ s: 1.04 - lt * 0.006, fx: W / 2, fy: H * 0.6, sy: H * 0.6 });
        place(sunG, 820 - travel * 0.02, 760);
        // palace silhouette sinks/slides away as forest takes over
        place(palSil, 540 - travel * 0.25 - tw(lt, 0, 1.6, 0, 300, ease.inCubic), 1250 + tw(lt, 0.2, 1.8, 0, 500, ease.inCubic));
        place(far, -400 - ((travel * 0.3) % 330), 1260 + tw(lt, 0, 0.9, 400, 0));
        place(mid, -300 - ((travel * 0.6) % 460), 1500 + tw(lt, 0, 0.7, 500, 0));
        place(groundG, 540 - (travel % 70), 1500);
        place(near, -300 - ((travel * 1.7) % 1000), 1990);
        place(nearB, -400 - ((travel * 1.4) % 520), 1960);

        const sl = onTwos(lt, 12);
        const ph = sl * Math.PI * 2 * 1.05;
        const enter = tw(lt, 0, 1.2, -260, 0, ease.outCubic);
        const wR = walk(ph), wS = walk(ph + 1.1, { stride: 0.8 }), wL = walk(ph + 2.2);
        rama.pose({ ...wR, x: 760 + enter, y: 1640 + wR.bob * 0.6, s: 0.64, bowWorld: 6, armF: [wR.armF[0] * 0.5 + 6, -30], head: 2, look: 0.4 });
        sita.pose({ ...wS, x: 525 + enter * 1.2, y: 1640 + wS.bob * 0.4, s: 0.6, armF: [16 + wS.armF[0] * 0.3, -40], head: 4, look: -0.3 });
        lak.pose({ ...wL, x: 290 + enter * 1.4, y: 1640 + wL.bob * 0.6, s: 0.64, bowWorld: 4, armF: [wL.armF[0] * 0.5 + 8, -28], head: 6, brow: 0.4 });

        kick.node.setAttribute('transform', `translate(540 ${tw(lt, 0.2, 0.6, 110, 230, ease.outCubic).toFixed(1)})`);
        kick.node.setAttribute('opacity', clamp((lt - 0.2) * 4) * (1 - clamp((lt - 5.3) * 4)));
        l1.node.setAttribute('transform', 'translate(540 500)');
        animateWords(l1, lt, 0.45, { mode: 'rise', dur: 0.4, stagger: 0.14, out: 5.25 });
        l2.node.setAttribute('transform', 'translate(560 690)');
        animateWords(l2, lt, 0.8, { mode: 'rise', dur: 0.4, stagger: 0.14, out: 5.3 });
      },
      particles(lt) {
        return [
          { seed: 21, count: 22, color: PAL.olive, area: [0, 0, W, H], rise: -90, drift: 60, size: [8, 14], shape: 'petal', local: lt, spin: 2 },
          { seed: 22, count: 26, color: PAL.cream, area: [0, 600, W, 1000], rise: 25, drift: 20, size: [2, 5], local: lt, alpha: 0.8 },
        ];
      },
    };
  },
};
