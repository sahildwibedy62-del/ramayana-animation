// SCENE 06 — 00:29–00:35 THE GREAT LEAP
import { PAL, W, H, tw, ease, clamp, onTwos, el, frag, track } from '../core/util.js';
import { headline, animateWords, halftoneField } from '../core/textures.js';
import { makeCharacter } from '../assets/characters.js';
import { waveBand, WAVE_W, cloud, sun, lanka } from '../assets/environments.js';
import { stage, place, shake, loopX } from './kit.js';
import { drawBurstParticles } from '../core/overlay.js';

const CLIFF = `<path d="M-400,0 L-400,-80 C-200,-120 0,-110 200,-90 C300,-80 380,-60 420,-20 C440,40 400,160 380,300 C360,500 300,700 260,900 L-400,900 Z" fill="${PAL.green}" stroke="${PAL.ink}" stroke-width="8" stroke-linejoin="round"/>
  <path d="M-400,-80 C-200,-120 0,-110 200,-90 C300,-80 380,-60 420,-20 L410,30 C300,0 0,-20 -400,0 Z" fill="${PAL.olive}" stroke="${PAL.ink}" stroke-width="6"/>
  <path d="M420,-20 C440,40 400,160 380,300 C360,500 300,700 260,900 L100,900 C160,600 240,300 300,40Z" fill="url(#hatch-ink)" opacity="0.7"/>
  <path d="M-300,100 L-100,260 L-260,420 M60,80 L140,300 L40,500" stroke="${PAL.ink}" stroke-width="5" fill="none"/>
  <rect x="-400" y="0" width="820" height="900" fill="url(#ht-ink)" mask="url(#m-fadeDown)" opacity="0.5"/>`;

export default {
  id: 's06', title: 'The Great Leap', start: 29, end: 35, transition: 'bars',
  build({ addHit }) {
    const st = stage(PAL.skyBlue);
    st.layer(halftoneField({ pattern: 'ht-cream', mask: 'm-fadeUp', opacity: 0.7, h: 1300 }));
    const sunG = st.layer(sun(150, { rays: 16 }));
    const cFar = st.layer(`<g>${cloud(260)}</g><g transform="translate(560 -120)">${cloud(200)}</g><g transform="translate(1100 60)">${cloud(240)}</g><g transform="translate(1650 -60)">${cloud(220)}</g>`);
    const lankaG = st.layer(lanka());
    const horizon = st.layer(`<rect x="-400" y="0" width="2000" height="900" fill="${PAL.blue}"/><path d="M-400,0 L1600,0" stroke="${PAL.ink}" stroke-width="6"/>`);
    const bands = [0, 1, 2].map((i) => st.layer(waveBand(14, { fill: [PAL.blue, '#1F5FA8', PAL.navy][i], h: 400 })));
    const cliff = st.layer(CLIFF);
    const hanu = makeCharacter('hanuman');
    st.layer(hanu.node);
    const cNear = st.layer(`<g>${cloud(420)}</g><g transform="translate(900 300)">${cloud(360)}</g><g transform="translate(1700 -100)">${cloud(400)}</g>`);

    const l1 = headline('ONE LEAP', { size: 240, fill: PAL.gold, sw: 9 });
    const l2 = headline('ACROSS THE OCEAN', { size: 118, fill: PAL.cream, plate: PAL.red });
    st.top.append(l1.node, l2.node);
    addHit(1.6, 'crouch / inhale');
    addHit(2.2, 'launch boom');
    addHit(2.45, '"ONE LEAP" drop');

    const S = { hx: 0, hy: 0 };
    return {
      node: st.root,
      faces: [hanu.head],
      texts: [l1.node, l2.node],
      update(lt) {
        const [sx, sy] = shake(lt, 2.2, 28, 0.5);
        // camera pulls back from Hanuman to reveal the vast ocean
        const cs = track(lt, [[0, 1.7], [1.6, 1.0, ease.inOutCubic], [6, 0.96, ease.linear]]);
        const fx = track(lt, [[0, 300], [1.6, 540, ease.inOutCubic]]);
        const fy = track(lt, [[0, 900], [1.6, 960, ease.inOutCubic]]);
        st.camera({ s: cs, fx, fy, sx: W / 2, sy: 960, shakeX: sx, shakeY: sy });
        place(sunG, 860, 380);
        place(cFar, loopX(lt, 50, 1800) + 100, 640);
        place(lankaG, 930 - lt * 4, 1180, 0.34);
        place(horizon, 0, 1180);
        bands.forEach((b, i) => {
          const sp = [40, 80, 130][i], y = [1230, 1420, 1640][i];
          place(b, loopX(lt + i * 0.3, sp * (i % 2 ? -1 : 1), WAVE_W) - WAVE_W * 2, y + Math.sin(lt * 2 + i) * 8, 1);
        });
        place(cliff, 0, 1160);
        place(cNear, loopX(lt, 260, 1800) + 200, lt > 2.2 ? 300 : -900);

        const sl = onTwos(lt, 15);
        let p;
        if (lt < 1.6) {
          p = { x: 250, y: 1080, s: 0.78, armF: [8, -10], armB: [-6, -10], gadaRot: -20, tail: sl * 50, head: 6 + Math.sin(lt * 2) * 2, look: 1 };
        } else if (lt < 2.2) {
          const k = tw(lt, 1.6, 2.0, 0, 1, ease.outCubic);
          p = { x: 250, y: 1080, s: 0.78, bob: 90 * k, lean: 18 * k, legF: [55 * k, 90 * k], legB: [30 * k, 100 * k], armF: [-40 * k, 20], armB: [-60 * k, 10], gadaRot: -60 * k, tail: sl * 120, tailCurl: 1.5, brow: k };
        } else {
          const k = clamp((lt - 2.2) / 3.6);
          const e = ease.outCubic(k);
          const x = 250 + e * 1150;
          const y = 1080 - 620 * ease.outExpo(clamp(k * 1.6)) + 260 * k * k;
          const s = 0.78 - 0.4 * k;
          p = { x, y, s, rot: 72 - 10 * Math.sin(k * Math.PI), armF: [178, 0], armB: [150, 14], legF: [-8, 18], legB: [-28, 40], gadaRot: 90, tail: sl * 200, tailCurl: 0.1, head: 55, brow: 0.6 };
          S.hx = x; S.hy = y - 300 * s;
        }
        hanu.pose(p);

        l1.node.setAttribute('transform', 'translate(540 1590)');
        animateWords(l1, lt, 2.4, { mode: 'drop', dur: 0.34, stagger: 0.14 });
        l2.node.setAttribute('transform', 'translate(540 1770)');
        animateWords(l2, lt, 2.85, { mode: 'rise', dur: 0.3, stagger: 0.08 });
      },
      particles(lt) {
        return [
          { seed: 61, count: 30, color: PAL.cream, area: [0, 0, W, 1200], rise: 0, drift: 10, size: [2, 4], local: lt, alpha: 0.8 },
          { seed: 62, count: 18, color: PAL.gold, area: [0, 200, W, 1000], rise: 60, drift: 30, size: [6, 12], shape: 'spark', local: lt, alpha: clamp((lt - 2.2) * 2) },
        ];
      },
      overlay(ctx, lt) {
        drawBurstParticles(ctx, { x: 260, y: 1090, k: (lt - 2.2) / 0.6, seed: 61, count: 34, color: PAL.olive, R: 420 });
        if (lt > 2.25) {
          // speed lines trailing Hanuman
          ctx.save();
          ctx.strokeStyle = PAL.cream; ctx.lineCap = 'round';
          for (let i = 0; i < 7; i++) {
            const off = ((lt * 900 + i * 140) % 520);
            ctx.globalAlpha = 0.7 * (1 - off / 520);
            ctx.lineWidth = 8 - i * 0.6;
            const y = S.hy + (i - 3) * 34;
            ctx.beginPath(); ctx.moveTo(S.hx - 140 - off, y + off * 0.25); ctx.lineTo(S.hx - 60 - off * 0.6, y + off * 0.15); ctx.stroke();
          }
          ctx.restore();
        }
      },
    };
  },
};
