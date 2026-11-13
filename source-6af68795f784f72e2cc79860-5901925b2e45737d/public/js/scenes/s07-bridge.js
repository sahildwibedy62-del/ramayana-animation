// SCENE 07 — 00:35–00:41 THE BRIDGE TO LANKA
import { PAL, W, H, tw, ease, clamp, onTwos, el, frag, track } from '../core/util.js';
import { headline, animateWords, halftoneField } from '../core/textures.js';
import { vanaraCarrier } from '../assets/characters.js';
import { waveBand, WAVE_W, stone, lanka, cloud, sun, label } from '../assets/environments.js';
import { stage, place, loopX } from './kit.js';

const SLOTS = 26, GAP = 148, BX = 60, BY = 1330;
const landT = (i) => 0.1 + i * 0.2;
const DIRS = [[-700, -1100], [800, -1200], [-200, 900], [600, 800], [-900, -300]];
const LABELS = [
  { t: 0.9, text: 'SETU · 100 YOJANAS', w: 380 },
  { t: 2.1, text: "EVERY STONE: 'RAMA'", w: 390 },
  { t: 3.3, text: 'VANARA SENA AT WORK', w: 400 },
  { t: 4.4, text: 'NEXT STOP · LANKA →', w: 380 },
];

export default {
  id: 's07', title: 'The Bridge to Lanka', start: 35, end: 41, transition: 'torn',
  build({ addHit }) {
    const st = stage(PAL.gold);
    st.layer(halftoneField({ pattern: 'ht-orange', mask: 'm-fadeDown', opacity: 0.9, h: 1100 }));
    const sunG = st.layer(sun(200, { rays: 20, color: PAL.cream }));
    const cl = st.layer(`<g>${cloud(260)}</g><g transform="translate(700 -100)">${cloud(220)}</g><g transform="translate(1400 40)">${cloud(280)}</g><g transform="translate(2100 -60)">${cloud(240)}</g>`);
    const lankaG = st.layer(lanka());
    const sea = st.layer(`<rect x="-1000" y="0" width="7000" height="1200" fill="${PAL.blue}"/><path d="M-1000,0 L6000,0" stroke="${PAL.ink}" stroke-width="6"/>`);
    const band1 = st.layer(waveBand(40, { fill: PAL.blue, h: 300 }));
    const bridge = st.layer(el('g'));
    const ripples = st.layer(el('g'));
    const stones = [];
    for (let i = 0; i < SLOTS; i++) {
      const g = frag(stone(300 + i, 160, 96));
      bridge.appendChild(g);
      const rp = el('ellipse', { fill: 'none', stroke: PAL.cream, 'stroke-width': 6 });
      ripples.appendChild(rp);
      stones.push({ g, rp, x: BX + i * GAP, y: BY + Math.sin(i * 1.7) * 6 });
      addHit(landT(i) + 0.45, `stone ${i + 1} lands`);
    }
    const crew = st.layer(el('g'));
    const carriers = Array.from({ length: 6 }, (_, i) => {
      const g = frag(`${vanaraCarrier(i + 1)}<g transform="translate(0 -300)">${stone(500 + i, 130, 80)}</g>`);
      crew.appendChild(g);
      return g;
    });
    const band2 = st.layer(waveBand(40, { fill: '#1F5FA8', h: 400 }));
    const band3 = st.layer(waveBand(40, { fill: PAL.navy, h: 400 }));
    const labels = LABELS.map((L) => {
      const g = frag(`<path d="M0,0 L-60,90" stroke="${PAL.ink}" stroke-width="4" stroke-dasharray="8 6"/><circle cx="-60" cy="90" r="9" fill="${PAL.red}" stroke="${PAL.ink}" stroke-width="3"/>${label(L.text, L.w)}`);
      st.top.appendChild(g);
      return { ...L, g };
    });

    const l1 = headline('AN ARMY', { size: 200, fill: PAL.cream, sw: 9 });
    const l2 = headline('UNITED', { size: 250, fill: PAL.red, plate: PAL.navy, sw: 9 });
    st.top.append(l1.node, l2.node);

    return {
      node: st.root,
      faces: [],
      texts: [l1.node, l2.node],
      update(lt) {
        // camera tracks along the bridge as it grows
        const fx = 540 + track(lt, [[0, 0], [6, 1800, ease.inOutQuad]]);
        st.camera({ s: 1, fx, fy: 1200, sy: 1200 });
        const camX = fx - 540;
        place(sunG, camX * 0.9 + 820, 520);
        place(cl, camX * 0.8 + loopX(lt, 20, 700), 760);
        place(lankaG, camX * 0.85 + 1000, 1040, 0.32);
        place(sea, 0, 1040);
        place(band1, loopX(lt, 40, WAVE_W) - 1000, 1180 + Math.sin(lt * 2) * 6);
        place(band2, loopX(lt, -70, WAVE_W) - 1000, 1440 + Math.sin(lt * 2.4) * 8);
        place(band3, loopX(lt, 110, WAVE_W) - 1000, 1660 + Math.sin(lt * 2.8) * 10);

        stones.forEach((s, i) => {
          const t0 = landT(i), k = clamp((lt - t0) / 0.45);
          const [dx, dy] = DIRS[i % DIRS.length];
          if (k <= 0) { s.g.setAttribute('opacity', 0); s.rp.setAttribute('opacity', 0); return; }
          const e = ease.outCubic(k);
          const arc = Math.sin(k * Math.PI) * -160;
          const x = s.x + dx * (1 - e), y = s.y + dy * (1 - e) + arc * (dy > 0 ? -0.3 : 1);
          const rot = (1 - e) * (i % 2 ? 260 : -220);
          const bounce = k >= 1 ? Math.sin(clamp((lt - t0 - 0.45) / 0.3) * Math.PI) * -8 : 0;
          s.g.setAttribute('transform', `translate(${x.toFixed(1)} ${(y + bounce).toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${(0.7 + 0.3 * e).toFixed(3)})`);
          s.g.setAttribute('opacity', 1);
          const rk = clamp((lt - t0 - 0.42) / 0.7);
          s.rp.setAttribute('cx', s.x); s.rp.setAttribute('cy', s.y + 40);
          s.rp.setAttribute('rx', (60 + rk * 200).toFixed(1)); s.rp.setAttribute('ry', (12 + rk * 40).toFixed(1));
          s.rp.setAttribute('opacity', rk > 0 && rk < 1 ? (1 - rk).toFixed(2) : 0);
        });
        // crew walks behind the leading edge of the bridge
        const lead = BX + Math.max(0, Math.floor((lt - 0.55) / 0.2)) * GAP;
        const sl = onTwos(lt, 12);
        carriers.forEach((c, i) => {
          const x = Math.min(lead - 40, 200 + lt * 290 + i * 170 - 380);
          const bob = Math.abs(Math.sin(sl * 7 + i)) * -14;
          c.setAttribute('transform', `translate(${x.toFixed(1)} ${(BY - 30 + bob).toFixed(1)}) scale(0.78)`);
          c.setAttribute('opacity', x > -200 ? 1 : 0);
        });

        labels.forEach((L, i) => {
          const k = clamp((lt - L.t) / 0.25), ko = clamp((lt - L.t - 1.0) / 0.2);
          const x = [130, 520, 160, 560][i], y = [1000, 860, 980, 860][i];
          L.g.setAttribute('transform', `translate(${x} ${y}) scale(${(ease.outBack(k) * (1 - ko)).toFixed(3)})`);
          L.g.setAttribute('opacity', (k * (1 - ko)).toFixed(2));
        });

        l1.node.setAttribute('transform', 'translate(540 330)');
        animateWords(l1, lt, 0.35, { mode: 'left', dur: 0.4, stagger: 0.1 });
        l2.node.setAttribute('transform', 'translate(540 580)');
        animateWords(l2, lt, 0.65, { mode: 'slam', dur: 0.3, from: 2.6 });
      },
      particles(lt) {
        return [{ seed: 71, count: 34, color: PAL.cream, area: [0, 1100, W, 800], rise: 20, drift: 30, size: [2, 5], local: lt, alpha: 0.9 }];
      },
    };
  },
};
