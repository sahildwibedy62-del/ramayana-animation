// SCENE 10 — 00:52–01:00 RETURN TO AYODHYA
// Rama, Sita and Lakshmana return; Hanuman bows. Hundreds of diyas light in sequence,
// the camera pulls back to reveal the glowing city, and "JAI SHREE RAM" lands and holds.
import { PAL, W, H, tw, ease, clamp, el, frag, rng, onTwos } from '../core/util.js';
import { headline, animateWords, halftoneField, kicker, underline } from '../core/textures.js';
import { makeCharacter, walk } from '../assets/characters.js';
import { sun, palace, skyline, ground, diya, flameD, bush } from '../assets/environments.js';
import { stage, place } from './kit.js';

const GROUND_Y = 1800;
const PULL = [2.4, 5.8]; // camera pull-back window
const FINAL_IN = 5.9; // final title begins
const FINAL_SET = 6.35; // final title fully settled → held to 8.0 s (1.65 s hold)
const CENTER = [540, 1500]; // the light spreads outward from the palace gate

export default {
  id: 's10', title: 'Return to Ayodhya', start: 52, end: 60, transition: 'iris',
  build({ addHit }) {
    const st = stage(PAL.navy);
    st.layer(halftoneField({ pattern: 'ht-blue', mask: 'm-fadeDown', opacity: 0.8, y: -300, h: 1500 }));
    const horizon = st.layer(halftoneField({ pattern: 'ht-orange', mask: 'm-fadeUp', opacity: 0, y: 700, h: 900 }));
    const moon = st.layer(sun(210, { rays: 20, color: PAL.cream }));
    // depth layer 1: far skyline with tiny window lamps
    const farG = st.layer(skyline(PAL.blue, 5, 2600, 0) + `<rect x="-1300" y="-4" width="2600" height="300" fill="${PAL.blue}"/>`);
    // depth layer 2: the palace of Ayodhya
    const palG = st.layer(palace({ main: PAL.gold, trim: PAL.red, arch: PAL.navy, shade: 'ht-orange' }));
    // depth layer 3: courtyard ground and bushes
    const groundG = st.layer(ground(PAL.green, 3200, 1400, 'ht-navy') + `<rect x="-1600" y="0" width="3200" height="26" fill="${PAL.red}" stroke="${PAL.ink}" stroke-width="5"/>
      <path d="M-1600,13 L1600,13" stroke="${PAL.gold}" stroke-width="5" stroke-dasharray="14 14"/>`);

    // ---- diyas: palace terraces + far rooftops + four courtyard rows ----
    const lamps = [];
    const addLamp = (parent, x, y, s, wx, wy) => {
      const g = frag(`<circle class="gl" r="62" fill="${PAL.gold}" opacity="0"/><circle class="gl2" r="30" fill="url(#ht-gold)" opacity="0"/>${diya()}<path class="fl" d="${flameD(1)}" fill="${PAL.gold}" stroke="${PAL.ink}" stroke-width="3"/><path class="fc" d="${flameD(0.5)}" fill="${PAL.cream}"/>`,
        { transform: `translate(${x} ${y}) scale(${s})` });
      parent.appendChild(g);
      lamps.push({ g, gl: g.querySelector('.gl'), gl2: g.querySelector('.gl2'), fl: g.querySelector('.fl'), fc: g.querySelector('.fc'), wx, wy, i: lamps.length });
    };
    const palLamps = el('g');
    palG.appendChild(palLamps);
    for (let x = -430; x <= 430; x += 43) addLamp(palLamps, x, -284, 0.5, 540 + x, 1500 - 284);
    for (let x = -190; x <= 190; x += 38) addLamp(palLamps, x, -484, 0.45, 540 + x, 1500 - 484);
    for (const cx of [-365, 365]) for (let x = -50; x <= 50; x += 33) addLamp(palLamps, cx + x, -544, 0.42, 540 + cx + x, 1500 - 544);
    for (let x = -420; x <= 420; x += 60) addLamp(palLamps, x, -6, 0.55, 540 + x, 1494);
    const farLamps = el('g');
    farG.appendChild(farLamps);
    const r = rng(1010);
    for (let i = 0; i < 46; i++) {
      const x = -1200 + i * 52 + r() * 20, y = -40 - r() * 160;
      addLamp(farLamps, x, y, 0.28, 540 + x, 1420 + y);
    }
    const rows = el('g');
    groundG.appendChild(rows);
    [[90, 0.62, 72], [220, 0.78, 88], [380, 0.96, 108], [580, 1.18, 132]].forEach(([y, s, gap], ri) => {
      for (let x = -1500 + (ri % 2) * gap * 0.5; x <= 1500; x += gap) addLamp(rows, x, y, s, 540 + x, GROUND_Y + y);
    });
    // sequential illumination: order by distance from the palace gate, with a soft ripple
    const dist = (L) => Math.hypot(L.wx - CENTER[0], (L.wy - CENTER[1]) * 1.3);
    const maxD = Math.max(...lamps.map(dist));
    lamps.forEach((L) => (L.on = 0.35 + (dist(L) / maxD) * 4.6 + ((L.i * 7) % 5) * 0.03));

    // characters
    const bushes = st.layer(`<g transform="translate(-520 0)">${bush(380, 31)}</g><g transform="translate(1600 0)">${bush(420, 32)}</g>`);
    const lak = makeCharacter('lakshmana');
    const sita = makeCharacter('sita');
    const rama = makeCharacter('rama');
    const hanu = makeCharacter('hanuman');
    st.layer(lak.node); st.layer(sita.node); st.layer(rama.node); st.layer(hanu.node);

    // typography
    const k1 = kicker('AFTER FOURTEEN YEARS', { size: 38, bg: PAL.red });
    const a1 = headline('THE RETURN', { size: 160, fill: PAL.cream, sw: 8 });
    const a2 = headline('OF RAMA', { size: 230, fill: PAL.gold, plate: PAL.red, sw: 10, dx: 13, dy: 13 });
    const b1 = headline('THE VICTORY OF', { size: 120, fill: PAL.cream, sw: 7 });
    const b2 = headline('GOOD OVER EVIL', { size: 150, fill: PAL.gold, plate: PAL.red, sw: 8 });
    const hl = underline(b2.words[0].w * 1.1, { color: PAL.red, thickness: 30 });
    const f0 = kicker('THE RAMAYANA', { size: 40, bg: PAL.blue });
    const f1 = headline('JAI SHREE', { size: 190, fill: PAL.cream, sw: 9, dx: 15, dy: 15 });
    const f2 = headline('RAM', { size: 400, fill: PAL.gold, plate: PAL.red, sw: 12, dx: 20, dy: 20 });
    const fUl = underline(f2.width * 0.95, { color: PAL.red, thickness: 26 });
    st.top.append(k1.node, a1.node, a2.node, hl.node, b1.node, b2.node, f0.node, fUl.node, f1.node, f2.node);

    addHit(0.35, 'first diya lights');
    addHit(1.6, '"OF RAMA" slam');
    addHit(2.2, 'Hanuman bows');
    addHit(PULL[0], 'camera pull-back (music swell)');
    addHit(3.4, '"GOOD OVER EVIL"');
    addHit(FINAL_IN + 0.25, '"RAM" final slam');
    addHit(8.0, 'end of film');

    return {
      node: st.root,
      faces: [rama.head, sita.head, lak.head, hanu.head],
      texts: [a1.node, a2.node, b1.node, b2.node, f1.node, f2.node],
      update(lt) {
        // camera: close on the family at the gate → pull back over the city → hold
        const pk = ease.inOutCubic(clamp((lt - PULL[0]) / (PULL[1] - PULL[0])));
        const cs = 1.42 + (0.74 - 1.42) * pk + (lt < PULL[0] ? -lt * 0.02 : 0);
        const fy = 1620 + (1330 - 1620) * pk;
        st.camera({ fx: 540, fy, s: cs, sy: H * (0.66 - 0.06 * pk) });

        const glowAll = clamp((lt - 0.4) / 5);
        horizon.setAttribute('opacity', (glowAll * 0.85).toFixed(3));
        place(moon, 800, 560 - pk * 60, 0.9);
        moon.firstElementChild.setAttribute('transform', `rotate(${(lt * 5).toFixed(1)})`);
        place(farG, 540 - lt * 4, 1420);
        place(palG, 540, 1500);
        place(groundG, 540, GROUND_Y);
        place(bushes, 0, GROUND_Y + 30);

        // diyas light up one after another, then flicker (deterministic)
        lamps.forEach((L) => {
          const k = clamp((lt - L.on) / 0.22);
          const fk = onTwos(lt, 12);
          const flick = k > 0 ? 0.85 + 0.15 * Math.sin(fk * 17 + L.i * 1.7) : 0;
          L.fl.setAttribute('d', flameD(ease.outBack(k) * flick));
          L.fc.setAttribute('d', flameD(0.5 * ease.outBack(k) * flick));
          L.fl.setAttribute('opacity', k > 0 ? 1 : 0);
          L.fc.setAttribute('opacity', k > 0 ? 1 : 0);
          L.gl.setAttribute('opacity', (k * (0.22 + 0.06 * Math.sin(fk * 9 + L.i))).toFixed(3));
          L.gl2.setAttribute('opacity', (k * 0.8).toFixed(3));
        });

        // the trio walks home, then stands; Hanuman kneels and bows
        const wk = clamp(lt / 1.6);
        const ph = lt * 7.5;
        const walking = lt < 1.6;
        const wR = walk(ph, { stride: 0.8 }), wS = walk(ph + 1.9, { stride: 0.7 }), wL = walk(ph + 3.6, { stride: 0.8 });
        const still = { legF: [0, 4], legB: [0, 4], bob: 0, skirt: 0 };
        const enter = (1 - ease.outCubic(wk)) * -420;
        const R = walking ? wR : still, S = walking ? wS : still, L = walking ? wL : still;
        lak.pose({ ...L, x: 150 + enter, y: GROUND_Y + (L.bob || 0) * 0.6, s: 0.6, armF: [12, -30], armB: [-6, -10], bowWorld: 4, head: 2, look: 0.5 });
        sita.pose({ ...S, x: 300 + enter, y: GROUND_Y + (S.bob || 0) * 0.4, s: 0.57, armF: [26, -60], armB: [-4, -16], head: 4, look: 0.6 });
        const bless = tw(lt, 2.4, 2.9, 0, 1, ease.outBack);
        rama.pose({ ...R, x: 470 + enter, y: GROUND_Y + (R.bob || 0) * 0.6, s: 0.62, armF: [12 + bless * 56, -30 - bless * 40], armB: [-8, -10], bowWorld: bless * 10, head: -3 * bless, look: 1 });
        const bow = tw(lt, 1.9, 2.5, 0, 1, ease.outCubic);
        hanu.pose({
          x: 800, y: GROUND_Y, s: 0.58, flip: true, bob: 130 * bow, lean: 14 * bow,
          legF: [80 * bow, 85 * bow], legB: [12 * bow, 100 * bow],
          armF: [10 + 40 * bow, 20 + 95 * bow], armB: [10 + 36 * bow, 20 + 100 * bow],
          gadaOn: bow < 0.4, head: -14 * bow, eyes: lt > 2.5 ? 0 : 1, tail: onTwos(lt, 15) * 60, tailCurl: 1.3,
        });

        // ---- typography ----
        k1.node.setAttribute('transform', `translate(${tw(lt, 0.3, 0.7, -600, 540, ease.outExpo).toFixed(1)} 190) rotate(-2)`);
        const aOut = tw(lt, 2.3, 2.6, 0, 1, ease.inCubic);
        k1.node.setAttribute('opacity', (1 - aOut).toFixed(3));
        a1.node.setAttribute('transform', 'translate(540 380)');
        animateWords(a1, lt, 0.9, { mode: 'rise', dur: 0.35, stagger: 0.1, out: 2.3 });
        a2.node.setAttribute('transform', 'translate(540 610)');
        animateWords(a2, lt, 1.5, { mode: 'slam', dur: 0.28, from: 3, stagger: 0.1, out: 2.35 });

        b1.node.setAttribute('transform', 'translate(540 360)');
        animateWords(b1, lt, 2.85, { mode: 'left', dur: 0.4, stagger: 0.09, out: 5.4 });
        b2.node.setAttribute('transform', 'translate(540 540)');
        animateWords(b2, lt, 3.3, { mode: 'drop', dur: 0.4, stagger: 0.13, out: 5.45 });
        const gw = b2.words[0];
        hl.node.setAttribute('transform', `translate(${(540 + gw.x - 10).toFixed(1)} 580)`);
        hl.set(tw(lt, 3.9, 4.3, 0, 1) * (1 - tw(lt, 5.4, 5.6, 0, 1)));

        // final title — scales into position with a heavy navy shadow and holds
        f0.node.setAttribute('transform', `translate(540 ${tw(lt, FINAL_IN + 0.5, FINAL_IN + 0.8, 1100, 1010, ease.outBack).toFixed(1)})`);
        f0.node.setAttribute('opacity', clamp((lt - FINAL_IN - 0.5) * 5).toFixed(3));
        f1.node.setAttribute('transform', 'translate(540 470)');
        animateWords(f1, lt, FINAL_IN, { mode: 'rise', dur: 0.3, stagger: 0.08 });
        const fs = lt < FINAL_IN + 0.2 ? 0.001 : tw(lt, FINAL_IN + 0.2, FINAL_SET, 2.6, 1, ease.outBack);
        f2.node.setAttribute('transform', `translate(540 840) scale(${fs.toFixed(4)})`);
        f2.node.setAttribute('opacity', lt < FINAL_IN + 0.2 ? 0 : 1);
        fUl.node.setAttribute('transform', 'translate(560 905)');
        fUl.set(tw(lt, FINAL_SET - 0.1, FINAL_SET + 0.35, 0, 1));
      },
      particles(lt) {
        return [
          { seed: 101, count: 60, color: PAL.gold, area: [0, 100, W, 1800], rise: 55, drift: 30, size: [3, 8], local: lt, alpha: clamp(lt * 0.8) },
          { seed: 102, count: 18, color: PAL.gold, area: [0, 200, W, 1200], rise: 30, drift: 26, size: [10, 18], shape: 'spark', local: lt, alpha: clamp((lt - 2.5) * 0.8) },
          { seed: 103, count: 22, color: PAL.red, area: [0, 0, W, 1900], rise: -60, drift: 50, size: [9, 14], shape: 'petal', local: lt, alpha: clamp((lt - FINAL_IN) * 2) * 0.9, spin: 1.4 },
          { seed: 104, count: 40, color: PAL.cream, area: [0, 0, W, 900], rise: 4, drift: 3, size: [1.5, 3.5], local: lt, alpha: 0.7 },
        ];
      },
    };
  },
};
