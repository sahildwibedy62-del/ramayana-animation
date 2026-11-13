// SCENE 08 — 00:41–00:47 THE BATTLE OF LANKA
// Fast cinematic cuts: wide face-off → Rama close-up → Ravana close-up → wide (navy) with
// Ravana's silhouette swelling. Arrow volleys cross the frame; graphic impact bursts on hits.
import { PAL, W, H, tw, ease, clamp, onTwos, el, frag, track } from '../core/util.js';
import { headline, animateWords, halftoneField, kicker } from '../core/textures.js';
import { makeCharacter, makeRavana, warriorSilhouette, arrowMarkup } from '../assets/characters.js';
import { lanka, ground, impact, burst, mountains } from '../assets/environments.js';
import { stage, place, shake, hexLerp, vis } from './kit.js';
import { drawBurstParticles } from '../core/overlay.js';

// Cut points (local seconds). Each shot has its own camera.
const CUTS = [0, 1.5, 2.35, 3.2, 6];
const SHOTS = [
  { fx: 540, fy: 1300, s: 1.0, sy: 1300 }, // A: wide face-off (orange)
  { fx: 320, fy: 1420, s: 1.85, sy: 1120 }, // B: Rama close-up
  { fx: 790, fy: 1180, s: 1.45, sy: 1160 }, // C: Ravana close-up, heads fan out
  { fx: 540, fy: 1320, s: 1.0, sy: 1320 }, // D: wide (navy), Ravana expands
];

// Arrow volleys: [launch time, from side (1 = Rama's, -1 = enemy), lane y, flight seconds]
const VOLLEY = [];
for (let i = 0; i < 26; i++) {
  const side = i % 3 === 2 ? -1 : 1;
  VOLLEY.push({ t: 0.2 + i * 0.22 + ((i * 37) % 5) * 0.03, side, y: 700 + ((i * 211) % 900), dur: 0.42 + ((i * 13) % 4) * 0.06 });
}
// Impacts: [time, x, y, scale]
const IMPACTS = [[0.95, 760, 1240, 0.9], [2.0, 900, 1000, 1.1], [2.75, 640, 1180, 1.2], [3.6, 820, 980, 1.0], [4.4, 300, 1100, 0.9], [5.1, 760, 1300, 1.25]];

export default {
  id: 's08', title: 'The Battle of Lanka', start: 41, end: 47, transition: 'diag',
  build({ addHit }) {
    const st = stage(PAL.orange);
    const glow = st.layer(halftoneField({ pattern: 'ht-red', mask: 'm-fadeDown', opacity: 0.9, h: 1300 }));
    const sunG = st.layer(`${burst(24, 1600, PAL.gold, 120)}<circle r="250" fill="${PAL.gold}" stroke="${PAL.ink}" stroke-width="8"/><circle r="250" fill="url(#ht-red)" mask="url(#m-vign)"/>`);
    const navySky = st.layer(`<rect x="-400" y="-400" width="${W + 800}" height="${H + 800}" fill="${PAL.navy}"/><rect x="-400" y="-400" width="${W + 800}" height="1700" fill="url(#ht-blue)" opacity="0.55"/>`);
    // Layer 1 (far): Lanka fortress on its rock
    const lankaG = st.layer(lanka({ main: PAL.gold, rock: PAL.navy }));
    const hills = st.layer(mountains(PAL.deepRed, PAL.red, 2400, 360, 31));
    // Layer 2 (mid): two armies of silhouettes
    const armyFar = st.layer(el('g'));
    for (let i = 0; i < 22; i++) armyFar.appendChild(frag(warriorSilhouette(i + 3, PAL.navy), { transform: `translate(${-600 + i * 105} ${(i * 29) % 40}) scale(${(0.55 + ((i * 7) % 4) * 0.05).toFixed(2)} 0.6) ${i < 11 ? '' : 'scale(-1 1)'}` }));
    const armyMid = st.layer(el('g'));
    for (let i = 0; i < 16; i++) armyMid.appendChild(frag(warriorSilhouette(i + 40, PAL.ink), { transform: `translate(${-500 + i * 140} ${(i * 37) % 50}) scale(${i < 8 ? 0.85 : -0.85} 0.85)` }));
    const groundG = st.layer(ground(PAL.deepRed, 3000, 900, 'ht-ink') + `<path d="M-1500,6 L1500,6" stroke="${PAL.gold}" stroke-width="8"/>`);

    // Ravana's looming shadow (silhouette copy) + Ravana + Rama
    const shadowR = makeRavana();
    shadowR.node.setAttribute('filter', 'url(#sil-ink)');
    const shadowG = st.layer(shadowR.node);
    const rav = makeRavana();
    st.layer(rav.node);
    const rama = makeCharacter('rama');
    st.layer(rama.node);

    // Arrows + impact bursts live in world space
    const arrowsG = st.layer(el('g'));
    const arrows = VOLLEY.map((v) => {
      const g = frag(arrowMarkup(220));
      if (v.side < 0) g.querySelectorAll('path')[0].setAttribute('fill', PAL.red);
      arrowsG.appendChild(g);
      return { ...v, g };
    });
    const impactsG = st.layer(el('g'));
    const impacts = IMPACTS.map(([t, x, y, s], i) => {
      const g = frag(impact(170, i % 2 ? PAL.gold : PAL.cream));
      impactsG.appendChild(g);
      addHit(t, `impact ${i + 1}`);
      return { t, x, y, s, g };
    });
    // Foreground (layer 3): dark rubble + spears for depth
    const fg = st.layer(`<path d="M-200,0 C-60,-120 120,-80 240,-20 C360,-110 520,-90 640,-10 C780,-120 980,-70 1300,-30 L1300,300 L-200,300Z" fill="${PAL.ink}"/>
      <path d="M60,-40 L-40,-420 M140,-30 L200,-380 M900,-40 L860,-400 M980,-30 L1060,-360" stroke="${PAL.ink}" stroke-width="14"/>
      <path d="M-52,-440 L-30,-400 L-58,-404Z M204,-404 L210,-360 L186,-372Z M856,-424 L874,-384 L846,-388Z M1070,-384 L1068,-340 L1048,-356Z" fill="${PAL.ink}"/>`);

    // Speed lines for close-ups (screen space, behind type)
    const speed = el('g');
    for (let i = 0; i < 30; i++) {
      const a = (i / 30) * Math.PI * 2;
      speed.appendChild(el('path', { d: `M${(Math.cos(a) * 520).toFixed(0)},${(Math.sin(a) * 520).toFixed(0)} L${(Math.cos(a + 0.03) * 1500).toFixed(0)},${(Math.sin(a + 0.03) * 1500).toFixed(0)} L${(Math.cos(a - 0.03) * 1500).toFixed(0)},${(Math.sin(a - 0.03) * 1500).toFixed(0)}Z`, fill: i % 2 ? PAL.cream : PAL.ink, opacity: 0.55 }));
    }
    st.top.appendChild(speed);
    const flash = el('rect', { x: 0, y: 0, width: W, height: H, fill: PAL.cream });
    st.top.appendChild(flash);

    const l1 = headline('THE FINAL', { size: 150, fill: PAL.cream, sw: 8 });
    const l2 = headline('BATTLE', { size: 290, fill: PAL.gold, plate: PAL.red, sw: 10, dx: 14, dy: 14 });
    const nameRama = kicker('RAMA · PRINCE OF AYODHYA', { size: 38, bg: PAL.blue });
    const nameRav = kicker('RAVANA · KING OF LANKA', { size: 38, bg: PAL.red });
    st.top.append(l1.node, l2.node, nameRama.node, nameRav.node);

    CUTS.slice(1, -1).forEach((c, i) => addHit(c, `cut ${i + 2}`));
    addHit(0.35, '"THE FINAL" whoosh');
    addHit(0.6, '"BATTLE" slam');
    addHit(3.4, 'Ravana roar / swell');

    const shotAt = (lt) => { let i = 0; while (i < CUTS.length - 2 && lt >= CUTS[i + 1]) i++; return i; };

    return {
      node: st.root,
      faces: [rama.head],
      texts: [l1.node, l2.node],
      update(lt) {
        const shot = shotAt(lt);
        const sLt = lt - CUTS[shot];
        const cam = SHOTS[shot];
        // each shot keeps creeping in (cinematic push) — snappier in close-ups
        const push = shot === 0 ? sLt * 0.02 : shot === 3 ? sLt * 0.03 : sLt * 0.09;
        const hit = IMPACTS.reduce((acc, [t]) => (lt >= t && lt - t < acc[1] ? [t, lt - t] : acc), [-9, 9])[0];
        const [sx, sy] = shake(lt, hit, 22, 0.35);
        st.camera({ fx: cam.fx, fy: cam.fy, s: cam.s * (1 + push), sx: W / 2, sy: cam.sy, shakeX: sx, shakeY: sy });

        // warm orange → deep navy (completes during shot D)
        const night = tw(lt, 3.2, 4.6, 0, 1, ease.inOutCubic);
        st.bgRect.setAttribute('fill', hexLerp(PAL.orange, PAL.navy, night));
        navySky.setAttribute('opacity', night.toFixed(3));
        glow.setAttribute('opacity', (0.9 * (1 - night)).toFixed(3));
        place(sunG, 540, 900, 1 - night * 0.4);
        sunG.firstChild.setAttribute('transform', `rotate(${(lt * 12).toFixed(1)})`);
        sunG.setAttribute('opacity', (1 - night * 0.85).toFixed(3));

        // parallax: three depth layers drift at different speeds
        place(lankaG, 560 - lt * 6, 1240, 0.62);
        place(hills, 540 - lt * 10, 1330);
        place(armyFar, 540 - lt * 18 + Math.sin(onTwos(lt, 10) * 9) * 4, 1400);
        place(armyMid, 540 - lt * 30 + Math.sin(onTwos(lt, 10) * 7) * 6, 1520);
        place(groundG, 540, 1480);
        place(fg, -100 - lt * 50, 2000);
        armyFar.setAttribute('opacity', (1 - night * 0.3).toFixed(2));

        // RAMA — left, facing right, drawing and loosing arrows in rhythm
        const cyc = (lt % 0.9) / 0.9;
        const draw = shot === 1 ? tw(sLt, 0, 0.6, 0.2, 1, ease.outCubic) : cyc < 0.7 ? cyc / 0.7 : 0;
        rama.pose({
          x: 300, y: 1800, s: 0.9, armF: [86, 2], armB: [70 + draw * 12, -110 - draw * 14], bowWorld: -4,
          draw, arrowOn: draw > 0.05, lean: 4, head: -2, brow: shot === 1 ? 0.8 : 0.4, look: 1, legF: [16, 4], legB: [-14, 8],
        });

        // RAVANA — right; heads fan out in close-up, then swells to fill the frame
        const fan = shot === 0 ? 0.85 : shot === 2 ? tw(sLt, 0, 0.5, 0.6, 1.08, ease.outBack) : 1.08;
        const swell = shot === 3 ? tw(sLt, 0.1, 1.6, 0, 1, ease.outExpo) : 0;
        const rs = 0.78 + swell * 0.34;
        const ravPose = {
          x: 800 + swell * 20, y: 1900, s: rs, heads: 1, spread: fan, rage: 1, bob: Math.sin(lt * 5) * 6,
          armL: [30 + Math.sin(lt * 3) * 8, 30], armR: [-60 - (shot === 2 ? tw(sLt, 0, 0.4, 0, 40) : 20), -50],
        };
        rav.pose(ravPose);
        shadowR.pose({ ...ravPose, x: 820, y: 1960, s: rs * (1 + swell * 0.55), spread: fan * (1 + swell * 0.15) });
        shadowG.setAttribute('opacity', (swell * 0.55).toFixed(3));

        // arrows
        arrows.forEach((a) => {
          const k = (lt - a.t) / a.dur;
          if (k <= 0 || k >= 1) { a.g.setAttribute('opacity', 0); return; }
          const x0 = a.side > 0 ? -320 : W + 320, x1 = a.side > 0 ? W + 320 : -320;
          const x = x0 + (x1 - x0) * k;
          const y = a.y - Math.sin(k * Math.PI) * 140;
          const dy = -Math.cos(k * Math.PI) * 140 * Math.PI;
          const ang = (Math.atan2(dy, x1 - x0) * 180) / Math.PI;
          a.g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(ang + (a.side < 0 ? 0 : 0)).toFixed(1)})`);
          a.g.setAttribute('opacity', 1);
        });
        impacts.forEach((m) => {
          const k = (lt - m.t) / 0.32;
          if (k < 0 || k > 1) { m.g.setAttribute('opacity', 0); return; }
          m.g.setAttribute('transform', `translate(${m.x} ${m.y}) rotate(${(k * 40).toFixed(1)}) scale(${(m.s * ease.outBack(clamp(k * 2.5)) * (1 - k * 0.3)).toFixed(3)})`);
          m.g.setAttribute('opacity', (1 - Math.pow(k, 3)).toFixed(2));
        });

        // speed lines + 1-frame cream flash on every cut
        vis(speed, shot === 1 || shot === 2);
        speed.setAttribute('transform', `translate(${shot === 1 ? 420 : 700} ${shot === 1 ? 900 : 850}) rotate(${(onTwos(lt, 12) * 40).toFixed(1)})`);
        const sinceCut = sLt;
        flash.setAttribute('opacity', shot > 0 && sinceCut < 2 / 30 ? 0.85 : 0);

        // typography: title in the wide shots, name tags in the close-ups (kept off the faces)
        const titleOn = shot === 0 || shot === 3;
        vis(l1.node, titleOn); vis(l2.node, titleOn);
        l1.node.setAttribute('transform', 'translate(540 300)');
        l2.node.setAttribute('transform', 'translate(540 560)');
        if (shot === 0) {
          animateWords(l1, lt, 0.25, { mode: 'left', dur: 0.32, stagger: 0.08 });
          animateWords(l2, lt, 0.55, { mode: 'slam', dur: 0.26, from: 3 });
        } else {
          animateWords(l1, sLt, 0.0, { mode: 'right', dur: 0.28, stagger: 0.06 });
          animateWords(l2, sLt, 0.1, { mode: 'slam', dur: 0.24, from: 2.2 });
        }
        vis(nameRama.node, shot === 1);
        vis(nameRav.node, shot === 2);
        nameRama.node.setAttribute('transform', `translate(${tw(sLt, 0, 0.25, -500, 540, ease.outExpo).toFixed(1)} 1700) rotate(-2)`);
        nameRav.node.setAttribute('transform', `translate(${tw(sLt, 0, 0.25, 1600, 540, ease.outExpo).toFixed(1)} 300) rotate(2)`);
      },
      particles(lt) {
        const night = tw(lt, 3.2, 4.6, 0, 1);
        return [
          { seed: 81, count: 50, color: PAL.orange, area: [0, 400, W, 1500], rise: 120, drift: 40, size: [3, 7], shape: 'ember', local: lt, alpha: 0.9 },
          { seed: 82, count: 18, color: PAL.gold, area: [0, 300, W, 1400], rise: 60, drift: 30, size: [8, 14], shape: 'spark', local: lt, alpha: night },
        ];
      },
      overlay(ctx, lt) {
        // Impact streaks in screen space follow the shot's camera loosely (centre of frame)
        IMPACTS.forEach(([t], i) => drawBurstParticles(ctx, { x: 540 + ((i * 137) % 300) - 150, y: 1050 + ((i * 89) % 300), k: (lt - t) / 0.45, seed: 80 + i, count: 22, color: PAL.gold, R: 420 }));
      },
    };
  },
};
