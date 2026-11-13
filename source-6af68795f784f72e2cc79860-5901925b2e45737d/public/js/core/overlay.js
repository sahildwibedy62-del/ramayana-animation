// Texture engine (Canvas half): animated paper grain, print imperfections,
// registration drift and deterministic particles. Everything is a pure function of time.
import { W, H, FPS, rng, PAL } from './util.js';

const GRAIN_TILES = 6;
const TILE = 384;
let tiles = null, paper = null, specks = null;

function makeTiles() {
  tiles = [];
  for (let k = 0; k < GRAIN_TILES; k++) {
    const c = document.createElement('canvas');
    c.width = c.height = TILE;
    const x = c.getContext('2d');
    const img = x.createImageData(TILE, TILE);
    const r = rng(1000 + k);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = r();
      const dark = v < 0.5;
      img.data[i] = dark ? 17 : 255;
      img.data[i + 1] = dark ? 19 : 240;
      img.data[i + 2] = dark ? 25 : 201;
      img.data[i + 3] = Math.floor(Math.abs(v - 0.5) * 2 * 60);
    }
    x.putImageData(img, 0, 0);
    tiles.push(c);
  }
  // static paper fibre + blotch layer
  paper = document.createElement('canvas');
  paper.width = W; paper.height = H;
  const p = paper.getContext('2d');
  const r = rng(77);
  for (let i = 0; i < 900; i++) {
    p.strokeStyle = r() > 0.5 ? 'rgba(17,19,25,0.06)' : 'rgba(255,240,201,0.10)';
    p.lineWidth = 0.6 + r() * 1.2;
    const x = r() * W, y = r() * H, a = r() * Math.PI, l = 8 + r() * 36;
    p.beginPath(); p.moveTo(x, y); p.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 4, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); p.stroke();
  }
  for (let i = 0; i < 26; i++) {
    const x = r() * W, y = r() * H, rr = 60 + r() * 220;
    const gr = p.createRadialGradient(x, y, 0, x, y, rr);
    gr.addColorStop(0, `rgba(180,120,40,${0.03 + r() * 0.04})`);
    gr.addColorStop(1, 'rgba(180,120,40,0)');
    p.fillStyle = gr; p.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  // vignette (burnt print edges)
  const vg = p.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.75);
  vg.addColorStop(0, 'rgba(16,27,80,0)');
  vg.addColorStop(1, 'rgba(16,27,80,0.28)');
  p.fillStyle = vg; p.fillRect(0, 0, W, H);
  specks = Array.from({ length: 400 }, (_, i) => {
    const q = rng(5000 + i);
    return { x: q() * W, y: q() * H, r: 0.8 + q() * 2.6, life: q(), dark: q() > 0.35 };
  });
}

/** Draw texture overlay for absolute film time t onto ctx (1080x1920 space). */
export function drawTexture(ctx, t) {
  if (!tiles) makeTiles();
  const frame = Math.round(t * FPS);
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.55;
  ctx.drawImage(paper, 0, 0);
  ctx.restore();

  // animated grain: tile choice and offset hop every 2 frames (low intensity)
  const step = Math.floor(frame / 2);
  const r = rng(step * 7919 + 13);
  const tile = tiles[step % GRAIN_TILES];
  const ox = Math.floor(r() * TILE), oy = Math.floor(r() * TILE);
  ctx.save();
  ctx.globalAlpha = 0.42;
  ctx.globalCompositeOperation = 'source-over';
  for (let y = -oy; y < H; y += TILE) for (let x = -ox; x < W; x += TILE) ctx.drawImage(tile, x, y);
  ctx.restore();

  // occasional print specks & dust (each speck lives for a few frames)
  ctx.save();
  for (const s of specks) {
    const phase = (frame / 45 + s.life) % 1;
    if (phase > 0.08) continue;
    ctx.fillStyle = s.dark ? 'rgba(17,19,25,0.55)' : 'rgba(255,240,201,0.7)';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
  }
  // a rare hair/scratch line
  if (step % 37 < 2) {
    const q = rng(step);
    ctx.strokeStyle = 'rgba(17,19,25,0.35)'; ctx.lineWidth = 1.4;
    const x = q() * W, y = q() * H;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x + 30, y + 40, x - 20, y + 90, x + 10, y + 140); ctx.stroke();
  }
  ctx.restore();
}

// ---------- Particles ----------
// spec: { seed, count, color, area:[x,y,w,h], rise, drift, size:[a,b], shape:'dot'|'spark'|'petal'|'ember', alpha }
export function drawParticles(ctx, t, specs) {
  if (!specs) return;
  for (const sp of specs) {
    const { seed = 1, count = 30, color = PAL.gold, area = [0, 0, W, H], rise = 40, drift = 20, size = [3, 8], shape = 'dot', alpha = 1, local = t, spin = 1 } = sp;
    const [ax, ay, aw, ah] = area;
    for (let i = 0; i < count; i++) {
      const q = rng(seed * 1000 + i);
      const x0 = q(), y0 = q(), sz = size[0] + q() * (size[1] - size[0]), ph = q() * 6.28, sp2 = 0.6 + q() * 0.8;
      let y = ay + (((y0 * ah - local * rise * sp2) % ah) + ah) % ah;
      let x = ax + x0 * aw + Math.sin(local * 1.3 * sp2 + ph) * drift;
      const tw = 0.55 + 0.45 * Math.sin(local * 5 * sp2 + ph);
      ctx.save();
      ctx.globalAlpha = alpha * tw;
      ctx.translate(x, y);
      ctx.rotate(local * spin * sp2 + ph);
      ctx.fillStyle = color;
      ctx.strokeStyle = PAL.ink;
      ctx.lineWidth = 2;
      if (shape === 'spark') {
        const s = sz * (0.6 + tw * 0.6);
        ctx.beginPath();
        for (let k = 0; k < 8; k++) {
          const rr = k % 2 ? s * 0.28 : s;
          const a = (k / 8) * Math.PI * 2;
          ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke();
      } else if (shape === 'petal') {
        ctx.beginPath(); ctx.ellipse(0, 0, sz, sz * 0.45, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      } else if (shape === 'ember') {
        ctx.fillRect(-sz / 2, -sz / 2, sz, sz);
      } else if (shape === 'diamond') {
        ctx.beginPath(); ctx.moveTo(0, -sz); ctx.lineTo(sz * 0.6, 0); ctx.lineTo(0, sz); ctx.lineTo(-sz * 0.6, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.arc(0, 0, sz, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
  }
}

// Burst of radial streak particles (e.g. impact) at a point, k = 0..1 progress
export function drawBurstParticles(ctx, { x, y, k, seed = 3, count = 40, color = PAL.gold, R = 700 }) {
  if (k <= 0 || k >= 1) return;
  for (let i = 0; i < count; i++) {
    const q = rng(seed * 77 + i);
    const a = q() * Math.PI * 2, sp = 0.4 + q() * 0.6, len = 20 + q() * 60;
    const d = R * sp * (1 - Math.pow(1 - k, 3));
    ctx.save();
    ctx.globalAlpha = 1 - k;
    ctx.strokeStyle = i % 3 === 0 ? PAL.cream : color;
    ctx.lineWidth = 6 + q() * 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
    ctx.lineTo(x + Math.cos(a) * (d + len), y + Math.sin(a) * (d + len));
    ctx.stroke();
    ctx.restore();
  }
}
