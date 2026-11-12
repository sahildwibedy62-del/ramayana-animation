// Shared scene-building kit: layers, camera, colour interpolation, text placement.
import { el, frag, W, H, PAL, clamp, lerp } from '../core/util.js';

export function hexLerp(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = Math.round(lerp((pa >> 16) & 255, (pb >> 16) & 255, t));
  const g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, t));
  const bl = Math.round(lerp(pa & 255, pb & 255, t));
  return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`;
}

/** Scene root with a camera group. cam(x,y,scale,rot) zooms around a focus point. */
export function stage(bg = PAL.cream) {
  const root = el('g');
  const bgRect = el('rect', { x: -200, y: -200, width: W + 400, height: H + 400, fill: bg });
  root.appendChild(bgRect);
  const cam = el('g');
  root.appendChild(cam);
  const top = el('g'); // screen-space layer (typography) — not affected by camera
  root.appendChild(top);
  return {
    root, cam, top, bgRect,
    layer(markupOrNode, attrs = {}) {
      const n = typeof markupOrNode === 'string' ? frag(markupOrNode, attrs) : markupOrNode;
      if (typeof markupOrNode !== 'string') for (const k in attrs) n.setAttribute(k, attrs[k]);
      cam.appendChild(n);
      return n;
    },
    /** focus (fx,fy) in world space appears at screen centre-ish (sx,sy) with zoom s */
    camera({ fx = W / 2, fy = H / 2, s = 1, sx = W / 2, sy = H / 2, rot = 0, shakeX = 0, shakeY = 0 } = {}) {
      cam.setAttribute('transform', `translate(${(sx + shakeX).toFixed(2)} ${(sy + shakeY).toFixed(2)}) rotate(${rot.toFixed(3)}) scale(${s.toFixed(4)}) translate(${(-fx).toFixed(2)} ${(-fy).toFixed(2)})`);
    },
  };
}

export const place = (node, x, y, s = 1, r = 0) =>
  node.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r.toFixed(2)}) scale(${s.toFixed(4)})`);

// Deterministic camera shake that decays after a hit at time th
export function shake(t, th, amp = 26, dur = 0.45) {
  const k = (t - th) / dur;
  if (k < 0 || k > 1) return [0, 0];
  const d = (1 - k) * (1 - k) * amp;
  return [Math.sin(t * 91) * d, Math.cos(t * 73) * d];
}

// Repeating band offset (for looping waves etc.) — deterministic modulo of time
export const loopX = (t, speed, period) => -(((t * speed) % period) + period) % period;

// Parallax: world layers move at fraction p of camera travel
export const parallax = (node, x, y = 0, s = 1) => node.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})`);

export const vis = (node, on) => (node.style.display = on ? '' : 'none');
export const op = (node, v) => node.setAttribute('opacity', clamp(v).toFixed(3));
