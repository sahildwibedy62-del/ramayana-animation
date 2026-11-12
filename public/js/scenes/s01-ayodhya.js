// SCENE 01 — 00:00–00:05 THE KINGDOM OF AYODHYA
import { PAL, W, H, tw, ease, clamp } from '../core/util.js';
import { headline, kicker, animateWords, underline, halftoneField } from '../core/textures.js';
import { makeCharacter } from '../assets/characters.js';
import { sun, palace, skyline, bush, ground, cloud } from '../assets/environments.js';
import { stage, place, shake } from './kit.js';

export default {
  id: 's01', title: 'The Kingdom of Ayodhya', start: 0, end: 5, transition: null,
  build({ addHit }) {
    const st = stage(PAL.cream);
    st.layer(halftoneField({ pattern: 'ht-gold', mask: 'm-fadeDown', opacity: 1, h: 1300 }));
    st.layer(halftoneField({ y: 900, h: 600, pattern: 'ht-orange', mask: 'm-fadeUp', opacity: 0.7 }));
    const sunG = st.layer(sun(300));
    const rays = sunG.querySelector('.sun-rays');
    const cl1 = st.layer(cloud(300));
    const cl2 = st.layer(cloud(220));
    const far = st.layer(skyline(PAL.skyBlue, 3, 2000, 0));
    const far2 = st.layer(skyline(PAL.blue, 9, 2000, 0) + `<rect x="-1000" y="-4" width="2000" height="200" fill="${PAL.blue}"/>`);
    const pal = st.layer(palace());
    const fg = st.layer(`${ground(PAL.olive, 2600, 700)}
      <rect x="-1300" y="0" width="2600" height="26" fill="${PAL.red}" stroke="${PAL.ink}" stroke-width="5"/>
      <path d="M-1300,13 L1300,13" stroke="${PAL.gold}" stroke-width="5" stroke-dasharray="14 14"/>
      <g transform="translate(-420 120)">${bush(360, 5)}</g><g transform="translate(470 110)">${bush(300, 8)}</g>`);

    const rama = makeCharacter('rama');
    const ramaSil = makeCharacter('rama');
    ramaSil.node.setAttribute('filter', 'url(#sil-navy)');
    const ramaG = st.layer(rama.node);
    const silG = st.layer(ramaSil.node);

    const kick = kicker('AN ANCIENT EPIC', { size: 44 });
    const the = headline('THE', { size: 104, fill: PAL.cream });
    const title = headline('RAMAYANA', { size: 214, fill: PAL.gold, sw: 9, dx: 13, dy: 13 });
    const ul = underline(title.width * 0.9, { color: PAL.red, thickness: 20 });
    st.top.append(kick.node, the.node, ul.node, title.node);

    addHit(1.0, 'kicker whoosh');
    addHit(1.85, 'title slam');

    const ramaPose = (lt, x) => ({
      x, y: 1858, s: 0.8, armF: [12, -36], armB: [-8, -10], bowWorld: -4, head: Math.sin(lt * 1.3) * 1.2, bob: Math.sin(lt * 2) * 1.5,
    });

    return {
      node: st.root,
      faces: [rama.head],
      texts: [title.node, the.node, kick.node],
      update(lt) {
        const [sx, sy] = shake(lt, 1.85, 18, 0.4);
        st.camera({ s: 1 + lt * 0.014, fx: W / 2, fy: H * 0.55, sy: H * 0.55, shakeX: sx, shakeY: sy });
        const ss = tw(lt, 0, 1.3, 0.001, 1, ease.outBack);
        place(sunG, W / 2, 900 + tw(lt, 0, 1.3, 240, 0), ss);
        rays.setAttribute('transform', `rotate(${(lt * 7).toFixed(2)})`);
        place(cl1, 220 - lt * 14, 700 + tw(lt, 0.2, 1.4, 300, 0), 1);
        place(cl2, 900 + lt * 10, 560 + tw(lt, 0.3, 1.5, 300, 0), 1);
        place(far, W / 2 - lt * 6, 1330 + tw(lt, 0.1, 1.5, 460, 0));
        place(far2, W / 2 - lt * 12, 1400 + tw(lt, 0.2, 1.6, 560, 0));
        place(pal, W / 2 - lt * 18, 1470 + tw(lt, 0.3, 1.7, 760, 0), 0.92);
        place(fg, W / 2 - lt * 32, 1480 + tw(lt, 0, 1.2, 560, 0));
        const rx = tw(lt, 1.3, 2.5, 1300, 812, ease.outCubic) - lt * 32;
        rama.pose(ramaPose(lt, rx));
        ramaSil.pose(ramaPose(lt, rx));
        silG.setAttribute('opacity', (1 - tw(lt, 3.5, 4.5, 0, 1, ease.inOutQuad)).toFixed(3));
        ramaG.setAttribute('opacity', lt > 3.4 ? '1' : '0');

        kick.node.setAttribute('transform', `translate(${tw(lt, 0.9, 1.35, -700, W / 2, ease.outExpo).toFixed(1)} 250) rotate(-2)`);
        the.node.setAttribute('transform', 'translate(540 405)');
        animateWords(the, lt, 1.45, { mode: 'rise', dur: 0.35 });
        title.node.setAttribute('transform', 'translate(540 620)');
        animateWords(title, lt, 1.6, { mode: 'slam', dur: 0.3, from: 3.2 });
        ul.node.setAttribute('transform', 'translate(560 680)');
        ul.set(tw(lt, 2.2, 2.7, 0, 1, ease.outCubic));
      },
      particles(lt) {
        return [
          { seed: 11, count: 46, color: PAL.gold, area: [0, 200, W, H], rise: 60, drift: 30, size: [3, 8], local: lt, alpha: clamp(lt * 2) },
          { seed: 12, count: 14, color: PAL.gold, area: [0, 300, W, 1300], rise: 30, drift: 20, size: [8, 16], shape: 'spark', local: lt, alpha: clamp(lt - 1) },
        ];
      },
    };
  },
};
