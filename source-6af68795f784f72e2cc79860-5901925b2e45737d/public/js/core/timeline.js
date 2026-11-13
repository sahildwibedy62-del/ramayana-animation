// Master timeline: exactly 60 s / 1800 frames, 10 scene modules, deterministic render(t).
import { el, W, H, FPS, DURATION, clamp, ease, PAL } from './util.js';
import { buildDefs, tornEdgePath } from './textures.js';
import { drawTexture, drawParticles } from './overlay.js';

export const TIN = 0.4; // transition length (s) — incoming scene is revealed over the outgoing one

// Narration script, timed to the visual beats (used for SRT export + preview captions).
export const NARRATION = [
  { start: 0.4, end: 4.7, text: 'Long ago, in the golden kingdom of Ayodhya, a prince was born to uphold dharma.' },
  { start: 5.2, end: 10.7, text: 'Rama, with Sita and his brother Lakshmana, left the palace for fourteen years of exile.' },
  { start: 11.2, end: 16.7, text: 'In the forest of Panchavati, a shimmering golden deer appeared — a trap.' },
  { start: 17.2, end: 22.7, text: 'The demon king Ravana revealed himself and carried Sita away to Lanka.' },
  { start: 23.2, end: 28.7, text: 'Then Hanuman met Rama, and offered him a devotion that would never break.' },
  { start: 29.2, end: 34.7, text: 'With a single mighty leap, Hanuman crossed the ocean.' },
  { start: 35.2, end: 40.7, text: 'An army of vanaras built a bridge of floating stones, all the way to Lanka.' },
  { start: 41.2, end: 46.7, text: 'And on the battlefield of Lanka, Rama faced the ten-headed Ravana.' },
  { start: 47.2, end: 51.8, text: 'One final arrow. Ravana fell. Dharma prevailed.' },
  { start: 52.3, end: 58.0, text: 'Rama returned home, and Ayodhya glowed with a thousand diyas.' },
  { start: 58.0, end: 60.0, text: 'Jai Shree Ram.' },
];

// Synchronised SFX / music hit points (for composers & sound designers)
export const HITS = [];
export const addHit = (t, name) => HITS.push({ t: +t.toFixed(3), frame: Math.round(t * FPS), name });

export class Film {
  constructor(svg, scenes) {
    this.svg = svg;
    this.scenes = scenes;
    this.t = 0;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    this.defs = buildDefs();
    svg.appendChild(this.defs);
    svg.appendChild(el('rect', { width: W, height: H, fill: PAL.cream }));
    this.layer = el('g', { 'clip-path': 'url(#frameClip)' });
    svg.appendChild(this.layer);
    this.fx = el('g'); // transition decorations (paper edges, streaks)
    svg.appendChild(this.fx);

    // validate exact boundaries
    let prev = 0;
    for (const s of scenes) {
      if (Math.abs(s.start - prev) > 1e-9) throw new Error(`Scene ${s.id} does not start at ${prev}`);
      prev = s.end;
    }
    if (Math.abs(prev - DURATION) > 1e-9) throw new Error('Scenes do not total 60 s');

    scenes.forEach((s, i) => {
      s.index = i;
      s.wrap = el('g', { 'data-scene': s.id, style: 'display:none' });
      s.clip = el('clipPath', { id: `clip-${s.id}` });
      s.clipShape = el('path', { d: '' });
      s.clip.appendChild(s.clipShape);
      this.defs.appendChild(s.clip);
      s.inst = s.build({ addHit: (lt, name) => addHit(s.start + lt, `${s.id}: ${name}`) });
      s.wrap.appendChild(s.inst.node);
      this.layer.appendChild(s.wrap);
    });
    HITS.sort((a, b) => a.t - b.t);
  }

  sceneAt(t) {
    return this.scenes.find((s) => t >= s.start && t < s.end) || this.scenes[this.scenes.length - 1];
  }

  /** Render the SVG state for absolute time t (seconds). Pure function of t. */
  render(t) {
    t = clamp(t, 0, DURATION - 1 / FPS / 2);
    this.t = t;
    this.fx.innerHTML = '';
    const cur = this.sceneAt(t);
    for (const s of this.scenes) {
      const next = this.scenes[s.index + 1];
      const outgoing = next && t >= next.start && t < next.start + TIN;
      const visible = s === cur || outgoing;
      if (!visible) {
        if (s.wrap.style.display !== 'none') s.wrap.style.display = 'none';
        continue;
      }
      s.wrap.style.display = '';
      const lt = t - s.start;
      s.inst.update(lt, t);
      s.wrap.removeAttribute('transform');
      s.wrap.removeAttribute('clip-path');
    }
    // incoming transition
    if (cur.index > 0 && t < cur.start + TIN) {
      const prev = this.scenes[cur.index - 1];
      const k = (t - cur.start) / TIN;
      this.applyTransition(cur.transition || 'iris', prev, cur, k);
    }
  }

  applyTransition(type, prev, cur, k) {
    const e = ease.inOutCubic(k);
    const fx = this.fx;
    const clipTo = (d) => {
      cur.clipShape.setAttribute('d', d);
      cur.wrap.setAttribute('clip-path', `url(#clip-${cur.id})`);
    };
    if (type === 'iris') {
      const r = 20 + e * 1250, cx = W / 2, cy = H * 0.45;
      clipTo(`M${cx - r},${cy} a${r},${r} 0 1,0 ${r * 2},0 a${r},${r} 0 1,0 ${-r * 2},0Z`);
      fx.innerHTML = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${PAL.ink}" stroke-width="22"/><circle cx="${cx}" cy="${cy}" r="${r + 16}" fill="none" stroke="${PAL.gold}" stroke-width="14"/>`;
    } else if (type === 'whip') {
      const off = (1 - ease.outExpo(k)) * W;
      cur.wrap.setAttribute('transform', `translate(${off.toFixed(1)} 0)`);
      prev.wrap.setAttribute('transform', `translate(${(off - W).toFixed(1)} 0)`);
      let s = '';
      for (let i = 0; i < 22; i++) {
        const y = (i * 97) % H, x = (i * 331) % W;
        s += `<rect x="${x - 200}" y="${y}" width="${500 + (i % 4) * 120}" height="${6 + (i % 3) * 6}" fill="${i % 2 ? PAL.cream : PAL.navy}" opacity="${(Math.sin(k * Math.PI) * 0.8).toFixed(2)}"/>`;
      }
      fx.innerHTML = s + `<rect x="${(off - 30).toFixed(1)}" y="0" width="30" height="${H}" fill="${PAL.ink}"/>`;
    } else if (type === 'torn') {
      const y = H + 200 - e * (H + 500);
      const d = tornEdgePath(-40, W + 40, y, 70, 45, 11 + cur.index, true, H * 2);
      clipTo(d);
      fx.innerHTML = `<path d="${tornEdgePath(-40, W + 40, y - 8, 70, 45, 11 + cur.index, true, 26)}" fill="${PAL.cream}" stroke="${PAL.ink}" stroke-width="4"/>`;
    } else if (type === 'diag') {
      const x = -W * 0.8 + e * W * 2.6;
      const d = `M${x - H * 0.6},${H + 40} L${x},-40 L-2000,-40 L-2000,${H + 40} Z`;
      clipTo(d);
      fx.innerHTML = `<path d="M${x - H * 0.6},${H + 40} L${x},-40" stroke="${PAL.red}" stroke-width="40"/><path d="M${x - H * 0.6 - 30},${H + 40} L${x - 30},-40" stroke="${PAL.ink}" stroke-width="10"/>`;
    } else if (type === 'burst') {
      const R = e * 1500, n = 16, cx = W / 2, cy = H * 0.5;
      let d = '';
      for (let i = 0; i < n * 2; i++) {
        const a = (i / (n * 2)) * Math.PI * 2 + k * 0.6;
        const rr = i % 2 ? R * 0.62 : R;
        d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)} `;
      }
      clipTo(d + 'Z');
      fx.innerHTML = `<path d="${d}Z" fill="none" stroke="${PAL.ink}" stroke-width="18" stroke-linejoin="round"/><path d="${d}Z" fill="none" stroke="${PAL.gold}" stroke-width="8" stroke-linejoin="round"/>`;
    } else if (type === 'bars') {
      // rectangles sliding in alternately (editorial blinds)
      const n = 6;
      let d = '';
      let deco = '';
      for (let i = 0; i < n; i++) {
        const kk = clamp(e * 1.6 - (i / n) * 0.6);
        const h = H / n;
        const w = kk * W;
        const x = i % 2 ? W - w : 0;
        d += `M${x},${i * h - 1} h${w} v${h + 2} h${-w} Z `;
        if (kk < 1) deco += `<rect x="${i % 2 ? x - 14 : x + w}" y="${i * h}" width="14" height="${h}" fill="${i % 2 ? PAL.red : PAL.gold}"/>`;
      }
      clipTo(d);
      fx.innerHTML = deco;
    }
  }

  /** Draw the canvas half of the frame (texture + particles). */
  drawOverlay(ctx, t, clear = true) {
    if (clear) ctx.clearRect(0, 0, W, H);
    const cur = this.sceneAt(t);
    const lt = t - cur.start;
    if (cur.inst.overlay) cur.inst.overlay(ctx, lt);
    if (cur.inst.particles) drawParticles(ctx, t, cur.inst.particles(lt));
    drawTexture(ctx, t);
  }
}
