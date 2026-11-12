// SCENE 04 — 00:17–00:23 THE ABDUCTION
import { PAL, W, H, tw, ease, clamp, onTwos, el, frag, track } from '../core/util.js';
import { headline, animateWords, halftoneField } from '../core/textures.js';
import { makeCharacter, makeRavana, makeVimana } from '../assets/characters.js';
import { tree, hut, ground, burst, cloud, bush } from '../assets/environments.js';
import { stage, place, shake, vis } from './kit.js';
import { hexLerp } from './kit.js';

const SAGE = `
  <path d="M-70,0 C-80,-120 -60,-260 -10,-330 C30,-340 60,-300 66,-240 C80,-160 90,-60 80,0 Z" fill="${PAL.orange}" stroke="${PAL.ink}" stroke-width="6" stroke-linejoin="round"/>
  <path d="M-70,0 C-80,-120 -60,-260 -10,-330 C-30,-240 -30,-120 -10,0Z" fill="url(#ht-red)" opacity="0.7"/>
  <circle cx="20" cy="-360" r="38" fill="${PAL.warmSkin}" stroke="${PAL.ink}" stroke-width="5"/>
  <path d="M-10,-372 C-20,-410 40,-420 56,-380 C40,-392 10,-394 -10,-372Z" fill="${PAL.cream}" stroke="${PAL.ink}" stroke-width="4"/>
  <path d="M10,-340 C20,-300 50,-300 60,-336 C50,-320 20,-322 10,-340Z" fill="${PAL.cream}" stroke="${PAL.ink}" stroke-width="4"/>
  <path d="M28,-366 L44,-364" stroke="${PAL.ink}" stroke-width="5"/>
  <path d="M-6,-372 L-2,-384 L4,-372" stroke="${PAL.red}" stroke-width="4" fill="none"/>
  <path d="M90,-420 L110,10" stroke="${PAL.ink}" stroke-width="12" stroke-linecap="round"/>
  <path d="M90,-420 L110,10" stroke="#6E3B1F" stroke-width="6" stroke-linecap="round"/>
  <path d="M40,-200 C60,-180 90,-190 96,-200 L40,-220Z" fill="#6E3B1F" stroke="${PAL.ink}" stroke-width="4"/>`;

export default {
  id: 's04', title: 'The Abduction', start: 17, end: 23, transition: 'diag',
  build({ addHit }) {
    const st = stage(PAL.orange);
    // ---- A: forest at dusk with the disguised Ravana ----
    const A = el('g');
    A.innerHTML = `<rect width="${W}" height="${H}" fill="${PAL.orange}"/>`;
    A.appendChild(halftoneField({ pattern: 'ht-red', mask: 'm-fadeDown', opacity: 0.9, h: 1300 }));
    const aTrees = frag(`<g transform="translate(120 1450) scale(0.9)">${tree({ seed: 140, leaf: PAL.green, light: PAL.olive })}</g>
      <g transform="translate(980 1430) scale(0.8)">${tree({ seed: 141, leaf: PAL.green, light: PAL.olive })}</g>`);
    A.appendChild(aTrees);
    A.appendChild(frag(`<g transform="translate(560 1450) scale(0.7)">${hut()}</g>`));
    A.appendChild(frag(`<g transform="translate(540 1450)">${ground(PAL.olive, 2400, 600, 'ht-green')}</g>`));
    const sitaA = makeCharacter('sita');
    const sage = frag(SAGE);
    A.appendChild(sitaA.node);
    A.appendChild(sage);
    A.appendChild(frag(`<g transform="translate(540 1960)">${bush(1200, 141, '#1B4A2D', PAL.green)}</g>`));
    const sweep = el('path', { fill: PAL.navy });
    const sweepEdge = el('path', { fill: 'none', stroke: PAL.red, 'stroke-width': 16 });
    A.append(sweep, sweepEdge);
    st.layer(A);

    // ---- B: the true form ----
    const B = el('g');
    const bBg = el('rect', { width: W, height: H, fill: PAL.red });
    B.appendChild(bBg);
    const bRays = frag(burst(30, 1700, PAL.deepRed));
    B.appendChild(bRays);
    B.appendChild(halftoneField({ pattern: 'ht-navy-lg', mask: 'm-vign', opacity: 0.9 }));
    const rav = makeRavana();
    B.appendChild(rav.node);
    st.layer(B);

    // ---- C: Pushpaka Vimana flight ----
    const C = el('g');
    C.innerHTML = `<rect width="${W}" height="${H}" fill="${PAL.navy}"/>`;
    C.appendChild(halftoneField({ pattern: 'ht-red', mask: 'm-fadeUp', opacity: 0.85 }));
    const moon = frag(`<circle r="200" fill="${PAL.red}" stroke="${PAL.ink}" stroke-width="7"/><circle r="200" fill="url(#ht-deep)" mask="url(#m-vign)"/>`);
    C.appendChild(moon);
    const clouds = frag(`<g transform="translate(0 0)">${cloud(360, PAL.cream)}</g><g transform="translate(620 -380)">${cloud(260, PAL.cream)}</g><g transform="translate(900 300)">${cloud(300, PAL.cream)}</g>`);
    C.appendChild(clouds);
    let farT = '', nearT = '';
    for (let i = 0; i < 8; i++) farT += `<g transform="translate(${i * 300} 0) scale(0.6)">${tree({ seed: 150 + i, leaf: PAL.blue, light: PAL.skyBlue, trunk: PAL.blue, dots: 'ht-navy' })}</g>`;
    for (let i = 0; i < 6; i++) nearT += `<g transform="translate(${i * 520} 0) scale(1.1)">${tree({ seed: 160 + i, leaf: PAL.ink, light: PAL.navy, trunk: PAL.ink, dots: 'ht-navy' })}</g>`;
    const cFar = frag(farT + `<rect x="-100" y="0" width="3000" height="800" fill="${PAL.blue}"/>`);
    const cNear = frag(nearT + `<rect x="-100" y="0" width="3200" height="900" fill="${PAL.ink}"/>`);
    C.append(cFar);
    const vim = makeVimana();
    const ravV = makeRavana();
    const sitaV = makeCharacter('sita');
    const vimG = el('g');
    const vimPeople = el('g');
    vimPeople.append(ravV.node, sitaV.node);
    const vimFront = frag(`<path d="M-300,-70 L336,-70 L330,-10 C200,10 -200,12 -310,-10 Z" fill="${PAL.gold}" stroke="${PAL.ink}" stroke-width="6"/>
      <path d="M-300,-40 L330,-40" stroke="${PAL.red}" stroke-width="12"/><path d="M-300,-40 L330,-40" stroke="${PAL.ink}" stroke-width="3" stroke-dasharray="6 12"/>
      <path d="M-300,-70 L330,-70 L330,-10 C200,10 -200,12 -310,-10Z" fill="url(#ht-orange)" opacity="0.6"/>`);
    vimG.append(vim.node, vimPeople, vimFront);
    C.appendChild(vimG);
    C.appendChild(cNear);
    st.layer(C);

    const l1 = headline('SITA', { size: 250, fill: PAL.cream, sw: 9 });
    const l2 = headline('WAS TAKEN', { size: 170, fill: PAL.red, plate: PAL.gold, sw: 8 });
    st.top.append(l1.node, l2.node);
    addHit(1.3, 'shadow sweep');
    addHit(1.7, 'Ravana reveal sting');
    addHit(3.0, 'cut to sky / vimana whoosh');
    addHit(3.5, 'title hit');

    const S = { ox: 0 };
    return {
      node: st.root,
      faces: [sitaA.head, sitaV.head],
      texts: [l1.node, l2.node],
      update(lt) {
        const phaseC = lt >= 3.0;
        const phaseB = lt >= 1.75 && !phaseC;
        vis(A, !phaseB && !phaseC);
        vis(B, phaseB);
        vis(C, phaseC);
        const [shx, shy] = shake(lt, 1.75, 34, 0.5);
        const [s2x, s2y] = shake(lt, 3.0, 20, 0.35);
        st.camera({ s: phaseB ? 1 + (lt - 1.75) * 0.05 : 1, shakeX: shx + s2x, shakeY: shy + s2y });

        if (!phaseB && !phaseC) {
          const sl = onTwos(lt, 12);
          sitaA.pose({ x: 330, y: 1760, s: 0.86, armF: [30 + tw(lt, 1.1, 1.4, 0, 30), -40], armB: [-4, -20], head: tw(lt, 1.0, 1.4, 0, 8), eyes: 1, brow: tw(lt, 1.2, 1.5, 0, 1), look: 1 });
          const lean = Math.sin(sl * 3) * 2;
          sage.setAttribute('transform', `translate(${(800 + tw(lt, 0, 0.8, 200, 0, ease.outCubic)).toFixed(1)} 1770) rotate(${lean.toFixed(2)}) scale(-0.95 0.95)`);
          // shadow sweep from right → left
          const k = tw(lt, 1.15, 1.75, 0, 1, ease.inCubic);
          const x = W + 300 - k * (W + 1100);
          sweep.setAttribute('d', k > 0 ? `M${x},-100 C${x - 120},${H * 0.3} ${x + 160},${H * 0.6} ${x - 60},${H + 100} L${W + 400},${H + 100} L${W + 400},-100 Z` : '');
          sweepEdge.setAttribute('d', k > 0 ? `M${x},-100 C${x - 120},${H * 0.3} ${x + 160},${H * 0.6} ${x - 60},${H + 100}` : '');
        }
        if (phaseB) {
          const k = lt - 1.75;
          bRays.setAttribute('transform', `translate(540 1100) rotate(${(k * 20).toFixed(2)})`);
          bBg.setAttribute('fill', hexLerp(PAL.navy, PAL.red, clamp(k * 3)));
          const s = tw(k, 0, 0.7, 0.3, 1.0, ease.outBack);
          rav.pose({ x: 540, y: 1960, s, heads: tw(k, 0.15, 0.9, 0, 1, ease.outCubic), spread: tw(k, 0.15, 1.0, 0.5, 1.05, ease.outBack), armL: [tw(k, 0.2, 0.7, 14, 60), 30], armR: [tw(k, 0.2, 0.7, -14, -70), -40], rage: 1, bob: Math.sin(lt * 6) * 4 });
        }
        if (phaseC) {
          const k = (lt - 3.0) / 3.0;
          place(moon, 820, 560 + k * 80);
          clouds.setAttribute('transform', `translate(${(200 - k * 700).toFixed(1)} ${(900 + k * 300).toFixed(1)})`);
          // forest layers rush opposite to the vimana's diagonal (down-left)
          cFar.setAttribute('transform', `translate(${(-200 - k * 500).toFixed(1)} ${(1520 + k * 260).toFixed(1)})`);
          cNear.setAttribute('transform', `translate(${(-300 - k * 1500).toFixed(1)} ${(1700 + k * 500).toFixed(1)})`);
          const vk = ease.inOutQuad(clamp(k));
          const vx = -380 + vk * 1880, vy = 1350 - vk * 1150;
          const bank = -14 + Math.sin(lt * 4) * 2;
          vimG.setAttribute('transform', `translate(${vx.toFixed(1)} ${vy.toFixed(1)}) rotate(${bank.toFixed(2)}) scale(0.82)`);
          ravV.pose({ x: 100, y: -20, s: 0.3, heads: 1, spread: 0.9, armL: [30, 20], armR: [-50, -40], rage: 1 });
          const reach = Math.sin(lt * 7) * 8;
          sitaV.pose({ x: -150, y: -20, s: 0.44, flip: true, armF: [140 + reach, -10], armB: [60, -30], head: 14, brow: 1, eyes: 1 });
        }

        l1.node.setAttribute('transform', 'translate(540 1560)');
        animateWords(l1, lt, 3.4, { mode: 'slam', dur: 0.28, from: 2.6 });
        l2.node.setAttribute('transform', 'translate(560 1760)');
        animateWords(l2, lt, 3.65, { mode: 'right', dur: 0.4, stagger: 0.12 });
      },
      particles(lt) {
        if (lt < 3) return [{ seed: 41, count: 20, color: PAL.gold, area: [0, 300, W, 1400], rise: 30, drift: 20, size: [2, 5], local: lt, alpha: 0.6 }];
        return [
          { seed: 42, count: 26, color: PAL.gold, area: [0, 0, W, H], rise: -260, drift: 30, size: [7, 13], shape: 'diamond', local: lt, alpha: 1, spin: 3 },
          { seed: 43, count: 40, color: PAL.cream, area: [0, 0, W, H], rise: 30, drift: 10, size: [1.5, 3.5], local: lt, alpha: 0.8 },
        ];
      },
    };
  },
};
