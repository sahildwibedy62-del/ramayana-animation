// SCENE 03 — 00:11–00:17 THE GOLDEN DEER
import { PAL, W, H, tw, ease, clamp, onTwos, el, track } from '../core/util.js';
import { headline, animateWords, halftoneField, underline } from '../core/textures.js';
import { makeCharacter, makeDeer, walk } from '../assets/characters.js';
import { tree, hut, frondPlant, mountains, ground, bush } from '../assets/environments.js';
import { stage, place } from './kit.js';
import { drawBurstParticles } from '../core/overlay.js';

export default {
  id: 's03', title: 'The Golden Deer', start: 11, end: 17, transition: 'torn',
  build({ addHit }) {
    const st = stage(PAL.cream);
    st.layer(halftoneField({ pattern: 'ht-green', mask: 'm-fadeDown', opacity: 0.55, h: 1200 }));
    const hills = st.layer(mountains(PAL.olive, '#A9B66A', 2000, 520, 8));
    const backTrees = st.layer(`<g transform="translate(-260 0) scale(0.75)">${tree({ seed: 101, leaf: PAL.olive, light: '#A9B66A', dots: 'ht-green' })}</g>
      <g transform="translate(330 0) scale(0.7)">${tree({ seed: 102, leaf: PAL.olive, light: '#A9B66A', dots: 'ht-green' })}</g>`);
    const hutG = st.layer(hut());
    const backDeerLayer = st.layer('');
    const groundG = st.layer(ground(PAL.olive, 2400, 700, 'ht-green'));
    const frontTree = st.layer(tree({ seed: 110, h: 1000, w: 560 }));
    const plants = st.layer(`<g transform="translate(-380 0)">${frondPlant(460)}</g><g transform="translate(420 20)">${frondPlant(380, PAL.green, '#A9B66A')}</g>`);
    const frontDeerLayer = st.layer('');
    const deer = makeDeer();
    const rama = makeCharacter('rama');
    const sita = makeCharacter('sita');
    st.layer(rama.node);
    st.layer(sita.node);
    const fgBush = st.layer(`<g transform="translate(-200 0)">${bush(520, 44, '#1B4A2D', PAL.green)}</g><g transform="translate(700 20)">${bush(420, 47, '#1B4A2D', PAL.green)}</g>`);
    const wipe = el('path', { fill: PAL.gold, stroke: PAL.ink, 'stroke-width': 10 });
    const wipe2 = el('path', { fill: PAL.red });
    st.top.append(wipe2, wipe);

    const l1 = headline('A GOLDEN', { size: 150, fill: PAL.cream });
    const l2 = headline('TRAP', { size: 300, fill: PAL.gold, sw: 10, dx: 14, dy: 14 });
    const ul = underline(l2.width * 1.1, { color: PAL.red, thickness: 22 });
    st.top.append(l1.node, ul.node, l2.node);
    addHit(0.4, 'deer appears (shimmer)');
    addHit(0.95, '"TRAP" drop');
    addHit(2.2, 'camera push-in');
    addHit(4.7, 'deer leap out');
    addHit(5.0, 'graphic wipe');

    const st8 = { deerScreen: [0, 0], cam: { s: 1, fx: 540, fy: 1250 } };

    return {
      node: st.root,
      faces: [sita.head, rama.head],
      texts: [l1.node, l2.node],
      update(lt) {
        const cs = track(lt, [[0, 1], [2.1, 1.02], [2.6, 1.3, ease.outExpo], [4.4, 1.34], [5.2, 1.08, ease.inOutCubic]]);
        const fx = track(lt, [[0, 540], [2.1, 560], [2.6, 640, ease.outExpo], [4.4, 660], [5.2, 600]]);
        const fy = 1250;
        st.camera({ s: cs, fx, fy, sx: W / 2, sy: 1250 });
        st8.cam = { s: cs, fx, fy };
        place(hills, 540 - lt * 6, 1330);
        place(backTrees, 540 - lt * 10, 1400);
        place(hutG, 830 - lt * 14, 1410, 0.66);
        place(groundG, 540, 1400);
        place(frontTree, 150 - lt * 22, 1560, 1.05);
        place(plants, 540 - lt * 26, 1580);
        place(fgBush, 540 - lt * 40, 1960);

        // deer path: back layer → hop behind front tree → leap into front layer → exit right
        const sl = onTwos(lt, 15);
        let dx, dy, ds, layer, gallop = 1, rot = 0, flip = true;
        if (lt < 1.4) {
          dx = tw(lt, 0, 1.4, 1150, 640); dy = 1415 - Math.abs(Math.sin(sl * 5)) * 40; ds = 0.5; layer = backDeerLayer;
        } else if (lt < 2.4) {
          const k = (lt - 1.4) / 1.0;
          dx = 640 - k * 40; dy = 1415 + k * 140 - Math.sin(k * Math.PI) * 260; ds = 0.5 + k * 0.34; layer = k > 0.5 ? frontDeerLayer : backDeerLayer; rot = -14 * Math.sin(k * Math.PI);
        } else if (lt < 4.6) {
          dx = 600 + Math.sin(lt * 2) * 10; dy = 1555; ds = 0.84; layer = frontDeerLayer; gallop = 0.25; flip = lt > 3.6 ? false : true;
        } else {
          const k = (lt - 4.6) / 0.8;
          dx = 600 + ease.inCubic(clamp(k)) * 900; dy = 1555 - Math.sin(clamp(k) * Math.PI) * 280; ds = 0.84; layer = frontDeerLayer; flip = false; rot = -20 * Math.sin(clamp(k) * Math.PI);
        }
        if (deer.node.parentNode !== layer) layer.appendChild(deer.node);
        deer.pose({ x: dx, y: dy, s: ds, flip, phase: sl * 11, gallop, rot, neck: gallop < 1 ? Math.sin(lt * 3) * 6 : 0 });
        st8.deerScreen = [(dx - fx) * cs + W / 2, (dy - 200 * ds - fy) * cs + 1250];

        // Sita notices (turns head, points), Rama turns and follows
        const point = tw(lt, 1.3, 1.7, 0, 1, ease.outBack);
        sita.pose({ x: 250, y: 1930, s: 0.95, armF: [10 + point * 75, -10 + point * 5], armB: [-6, -20], head: point * 6, eyes: 1, look: point, skirt: Math.sin(lt * 2) * 0.2 });
        const ramaIn = tw(lt, 2.7, 3.4, -300, 470, ease.outCubic);
        if (lt < 3.7) {
          rama.pose({ x: ramaIn, y: 1820, s: 0.82, flip: false, armF: [12, -30], bowWorld: 0, head: lt > 3.2 ? 4 : 0, look: 1 });
        } else {
          const k = clamp((lt - 3.9) / 1.6);
          const w = walk(sl * 16, { stride: 1.4, armSwing: 1.2 });
          rama.pose({ ...w, x: 470 + ease.inCubic(k) * 900, y: 1820 + w.bob, s: 0.82, armF: [24, -40], bowWorld: 18, lean: 8 * clamp((lt - 3.8) * 3), head: -3 });
        }

        l1.node.setAttribute('transform', 'translate(540 300)');
        animateWords(l1, lt, 0.5, { mode: 'left', dur: 0.4, stagger: 0.1, out: 4.6 });
        l2.node.setAttribute('transform', 'translate(540 600)');
        animateWords(l2, lt, 0.85, { mode: 'drop', dur: 0.35, out: 4.65 });
        ul.node.setAttribute('transform', 'translate(560 660)');
        ul.set(tw(lt, 1.3, 1.8, 0, 1) * (1 - tw(lt, 4.6, 4.9, 0, 1)));

        // fast graphic wipe following the deer
        const wk = tw(lt, 4.9, 5.6, 0, 1, ease.inOutCubic);
        const x0 = -1400 + wk * 3200;
        wipe.setAttribute('d', wk > 0 && wk < 1 ? `M${x0},-50 L${x0 + 500},-50 L${x0 + 160},${H + 50} L${x0 - 340},${H + 50} Z` : '');
        wipe2.setAttribute('d', wk > 0 && wk < 1 ? `M${x0 - 120},-50 L${x0 + 380},-50 L${x0 + 40},${H + 50} L${x0 - 460},${H + 50} Z` : '');
      },
      particles(lt) {
        const [x, y] = st8.deerScreen;
        return [
          { seed: 31, count: 26, color: PAL.gold, area: [x - 260, y - 300, 520, 520], rise: 80, drift: 40, size: [7, 16], shape: 'spark', local: lt, alpha: clamp(lt * 2) * (lt < 5.4 ? 1 : 0) },
          { seed: 32, count: 30, color: PAL.gold, area: [0, 0, W, H], rise: 40, drift: 30, size: [2, 5], local: lt, alpha: 0.7 },
        ];
      },
      overlay(ctx, lt) {
        const [x, y] = st8.deerScreen;
        drawBurstParticles(ctx, { x, y, k: (lt - 1.85) / 0.6, seed: 9, count: 30, color: PAL.gold, R: 420 });
      },
    };
  },
};
