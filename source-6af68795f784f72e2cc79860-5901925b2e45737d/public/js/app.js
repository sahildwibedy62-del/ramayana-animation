// Preview + export controller. The film itself is a pure function of time: film.render(t).
import { W, H, FPS, DURATION, TOTAL_FRAMES, fmtTime } from './core/util.js';
import { loadFonts } from './core/textures.js';
import { Film, NARRATION, HITS } from './core/timeline.js';
import { SCENES } from './scenes/index.js';
import { registry } from './assets/characters.js';
import { exportVideo, verifyPlayback, renderFrame, makeFrameCanvas, probeSupport, buildSRT, buildHitList, ffmpegCommand, download, frameVariance } from './export.js';

const $ = (id) => document.getElementById(id);
const svg = $('film');
const overlay = $('overlay');
const octx = overlay.getContext('2d');
const status = (msg, cls = '') => { const s = $('status'); s.textContent = msg; s.className = `status ${cls}`; };

let film;
let frame = 0;
let playing = false;
let playStart = 0, playFrom = 0;
let busy = false;
let audioEl = null;

function show(f) {
  frame = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(f)));
  const t = frame / FPS;
  film.render(t);
  if ($('optTexture').checked) film.drawOverlay(octx, t);
  $('scrubber').value = frame;
  $('tc').textContent = fmtTime(t);
  $('fc').textContent = `F ${String(frame + 1).padStart(4, '0')} / ${TOTAL_FRAMES}`;
  const sc = film.sceneAt(t);
  $('sceneNow').textContent = `SCENE ${String(sc.index + 1).padStart(2, '0')}`;
  $('sceneTitle').textContent = sc.title;
  document.querySelectorAll('#sceneList li').forEach((li, i) => li.classList.toggle('active', i === sc.index));
  document.querySelectorAll('#segments div').forEach((d, i) => d.classList.toggle('active', i === sc.index));
  const line = NARRATION.find((n) => t >= n.start && t < n.end);
  $('caption').innerHTML = line ? `<span>${line.text}</span>` : '';
}

function tick(now) {
  if (playing) {
    const t = playFrom + (now - playStart) / 1000;
    if (t >= DURATION) { show(TOTAL_FRAMES - 1); pause(); }
    else {
      const f = Math.floor(t * FPS);
      if (f !== frame) show(f);
    }
  }
  requestAnimationFrame(tick);
}

function play() {
  if (busy) return;
  if (frame >= TOTAL_FRAMES - 1) show(0);
  playing = true;
  playFrom = frame / FPS;
  playStart = performance.now();
  $('btnPlay').textContent = 'PAUSE';
  $('btnPlay').setAttribute('aria-label', 'Pause');
  if (audioEl) { audioEl.currentTime = playFrom; audioEl.play().catch(() => {}); }
}
function pause() {
  playing = false;
  $('btnPlay').textContent = 'PLAY';
  $('btnPlay').setAttribute('aria-label', 'Play');
  if (audioEl) audioEl.pause();
}
function seek(f) {
  const was = playing;
  if (was) pause();
  show(f);
  if (was) play();
}

function buildIndex() {
  const list = $('sceneList');
  const seg = $('segments');
  SCENES.forEach((s, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<button type="button"><span class="num">${String(i + 1).padStart(2, '0')}</span>
      <span class="tt">${s.title}<small>${s.transition ? `${s.transition} in` : 'cold open'} · ${(s.end - s.start) * FPS} frames</small></span>
      <span class="tr">${fmtTime(s.start).slice(3, 8)}–${s.end === 60 ? '01:00' : fmtTime(s.end).slice(3, 8)}</span></button>`;
    li.querySelector('button').onclick = () => seek(s.start * FPS);
    list.appendChild(li);
    const d = document.createElement('div');
    d.style.width = `${((s.end - s.start) / DURATION) * 100}%`;
    d.textContent = String(i + 1).padStart(2, '0');
    seg.appendChild(d);
  });
}

// ---------- export ----------
let abort = null;
async function refreshSupport() {
  const sup = await probeSupport(+$('bitrate').value);
  const mp4 = document.querySelector('input[name=fmt][value=mp4]');
  const webm = document.querySelector('input[name=fmt][value=webm]');
  mp4.disabled = !sup.mp4; webm.disabled = !sup.webm;
  if (!sup.mp4 && sup.webm) webm.checked = true;
  if (!sup.webcodecs) {
    $('support').innerHTML = '<span class="no">This browser has no WebCodecs encoder.</span> Use desktop Chrome or Edge, or the command-line renderer in <b>tools/render</b>.';
    $('btnRender').disabled = true;
    return sup;
  }
  $('support').innerHTML = `Encoders: MP4 ${sup.mp4 ? `<b>H.264 ✓</b>` : '<span class="no">H.264 ✗</span>'} · WebM ${sup.webm ? `<b>${sup.webm.label} ✓</b>` : '<span class="no">✗</span>'} · Audio ${sup.aac ? '<b>AAC ✓</b>' : ''}${sup.opus ? ' <b>Opus ✓</b>' : ''}${!sup.aac && !sup.opus ? '<span class="no">✗</span>' : ''}`;
  return sup;
}

async function runExport() {
  if (busy) return;
  pause();
  busy = true;
  const format = document.querySelector('input[name=fmt]:checked').value;
  const audioFile = $('audioFile').files[0] || null;
  $('btnRender').disabled = true;
  $('btnCancel').hidden = false;
  $('progress').hidden = false;
  $('result').hidden = true;
  const thumb = $('thumb').getContext('2d');
  abort = new AbortController();
  status(`Rendering ${format.toUpperCase()}…`);
  try {
    const res = await exportVideo({
      film, svg, format, bitrate: +$('bitrate').value, audioFile, signal: abort.signal,
      onProgress: ({ done, total, eta, canvas }) => {
        if (done % 3 === 0 || done === total) {
          $('bar').style.width = `${(done / total) * 100}%`;
          $('progText').textContent = `Frame ${done} / ${total} · ${Math.ceil(eta)} s left`;
          thumb.drawImage(canvas, 0, 0, 108, 192);
        }
      },
    });
    status('Verifying the exported file…');
    const v = await verifyPlayback(res.blob);
    const name = `ramayana-60s-1080x1920-30fps.${res.ext}`;
    const okFrames = res.frames === TOTAL_FRAMES && res.chunks === TOTAL_FRAMES;
    const okDims = v.width === W && v.height === H;
    const okDur = Math.abs(v.duration - DURATION) < 0.1;
    const row = (k, val, ok) => `<tr><td>${k}</td><td class="${ok === undefined ? '' : ok ? 'pass' : 'fail'}">${val}</td></tr>`;
    $('result').innerHTML = `
      <video src="${v.url}" controls playsinline></video>
      <table>
        ${row('Container / codec', `${res.ext.toUpperCase()} · ${res.label} (${res.codec})`)}
        ${row('Frames rendered → encoded', `${res.frames} → ${res.chunks}`, okFrames)}
        ${row('Keyframes', res.keyframes)}
        ${row('Blank frames detected', res.blankFrames, res.blankFrames === 0)}
        ${row('Decoded dimensions', `${v.width}×${v.height}`, okDims)}
        ${row('Decoded duration', `${v.duration?.toFixed(3)} s`, okDur)}
        ${row('Plays in browser', v.ok ? 'yes' : `no — ${v.error || ''}`, v.ok)}
        ${row('Audio track', res.audio ? `${res.audio.codec} · ${res.audio.chunks} packets` : 'none (silent)')}
        ${row('File size', `${(res.blob.size / 1048576).toFixed(1)} MB`)}
        ${row('Render time', `${res.seconds.toFixed(0)} s`)}
      </table>
      <a class="primary" href="${v.url}" download="${name}">Download ${res.ext.toUpperCase()}</a>`;
    $('result').hidden = false;
    if (res.ext === 'webm') $('ffcmd').closest('details').open = true;
    $('ffcmd').textContent = ffmpegCommand(res.ext === 'webm' ? name : 'ramayana-60s.webm');
    const allOk = okFrames && okDims && okDur && v.ok && res.blankFrames === 0;
    status(allOk ? `Export verified · ${res.frames} frames · ${v.width}×${v.height} · ${v.duration.toFixed(2)} s` : 'Export finished with warnings — see report', allOk ? 'ok' : 'err');
    window.__lastExport = { ...res, verify: v, allOk };
  } catch (e) {
    status(e.name === 'AbortError' ? 'Export cancelled' : `Export failed: ${e.message}`, 'err');
    console.error(e);
  } finally {
    busy = false;
    $('btnRender').disabled = false;
    $('btnCancel').hidden = true;
    show(frame);
  }
}

// ---------- QC ----------
async function runQC() {
  pause();
  const out = [];
  const add = (ok, label) => out.push(`<li><b class="${ok ? 'pass' : 'fail'}">${ok ? 'PASS' : 'FAIL'}</b><span>${label}</span></li>`);
  // 1-2. scene count + exact boundaries
  let prev = 0, contiguous = true, frames = 0;
  for (const s of SCENES) { if (s.start !== prev) contiguous = false; prev = s.end; frames += (s.end - s.start) * FPS; }
  add(SCENES.length === 10, `${SCENES.length} scene modules registered`);
  add(contiguous && prev === DURATION, `Boundaries contiguous, total ${prev}.000 s`);
  add(frames === TOTAL_FRAMES, `${frames} frames at ${FPS} fps (${W}×${H})`);
  // 3. character rigs come from the shared registry
  add(Object.keys(registry).length >= 5, `Shared rigs used: ${Object.entries(registry).map(([k, v]) => `${k}×${v}`).join(', ')}`);
  // 4-5. typography vs faces + transitions never blank — sampled across the whole film
  const { canvas, ctx } = makeFrameCanvas();
  const overlaps = [];
  let blank = 0, sampled = 0;
  const stageRect = svg.getBoundingClientRect();
  const sx = W / stageRect.width;
  for (let f = 0; f < TOTAL_FRAMES; f += 6) {
    film.render(f / FPS);
    const sc = film.sceneAt(f / FPS);
    const heads = (sc.inst.faces || []).map((n) => n.getBoundingClientRect()).filter((r) => r.width > 2);
    const words = [];
    for (const t of sc.inst.texts || []) {
      if (t.closest('[style*="display: none"]')) continue;
      t.querySelectorAll(':scope > g > g').forEach((w) => { if (+(w.getAttribute('opacity') ?? 1) > 0.6) words.push(w.getBoundingClientRect()); });
    }
    for (const h of heads) for (const w of words) {
      const ix = Math.max(0, Math.min(h.right, w.right) - Math.max(h.left, w.left));
      const iy = Math.max(0, Math.min(h.bottom, w.bottom) - Math.max(h.top, w.top));
      if (ix * iy > h.width * h.height * 0.2) { overlaps.push(fmtTime(f / FPS)); break; }
    }
  }
  add(overlaps.length === 0, overlaps.length ? `Text over a face at ${[...new Set(overlaps)].slice(0, 6).join(', ')}` : 'No headline covers a character face (300 samples)');
  status('QC: checking transitions for blank frames…');
  const transFrames = [];
  SCENES.forEach((s) => { if (s.start > 0) for (let k = -1; k <= 13; k += 2) transFrames.push(s.start * FPS + k); });
  for (const f of transFrames) {
    await renderFrame(film, svg, ctx, f);
    sampled++;
    if (frameVariance(canvas) < 2) blank++;
  }
  add(blank === 0, `${sampled} transition frames rasterised, ${blank} blank`);
  add(NARRATION[NARRATION.length - 1].end === DURATION && HITS.length > 0, `${NARRATION.length} narration cues, ${HITS.length} sync hit points`);
  $('qc').innerHTML = `<ul>${out.join('')}</ul>`;
  status('QC complete', out.some((x) => x.includes('fail')) ? 'err' : 'ok');
  show(frame);
}

// ---------- boot ----------
async function boot() {
  try {
    await loadFonts();
    film = new Film(svg, SCENES);
  } catch (e) {
    status(`Failed to build film: ${e.message}`, 'err');
    throw e;
  }
  buildIndex();
  $('ffcmd').textContent = ffmpegCommand();
  show(0);
  requestAnimationFrame(tick);
  status(`Ready · ${SCENES.length} scenes · ${TOTAL_FRAMES} frames`, 'ok');
  refreshSupport();

  $('btnPlay').onclick = () => (playing ? pause() : play());
  $('btnRestart').onclick = () => { pause(); show(0); };
  $('btnPrev').onclick = () => seek(frame - 1);
  $('btnNext').onclick = () => seek(frame + 1);
  $('scrubber').oninput = (e) => seek(+e.target.value);
  $('optCaptions').onchange = (e) => $('caption').classList.toggle('off', !e.target.checked);
  $('optSafe').onchange = (e) => ($('safe').hidden = !e.target.checked);
  $('optTexture').onchange = (e) => { overlay.classList.toggle('off', !e.target.checked); show(frame); };
  $('bitrate').onchange = refreshSupport;
  $('btnRender').onclick = runExport;
  $('btnCancel').onclick = () => abort?.abort();
  $('btnSrt').onclick = () => download(buildSRT(), 'ramayana-narration.srt');
  $('btnHits').onclick = () => download(buildHitList(SCENES), 'ramayana-timing.json', 'application/json');
  $('btnPng').onclick = async () => {
    const { canvas, ctx } = makeFrameCanvas();
    await renderFrame(film, svg, ctx, frame);
    show(frame);
    canvas.toBlob((b) => download(b, `ramayana-frame-${String(frame).padStart(4, '0')}.png`), 'image/png');
  };
  $('btnQc').onclick = runQC;
  $('audioFile').onchange = (e) => {
    const f = e.target.files[0];
    if (audioEl) { audioEl.pause(); URL.revokeObjectURL(audioEl.src); }
    audioEl = f ? new Audio(URL.createObjectURL(f)) : null;
  };
  window.addEventListener('keydown', (e) => {
    if (e.target.matches('input[type=file], select')) return;
    if (e.code === 'Space') { e.preventDefault(); playing ? pause() : play(); }
    else if (e.code === 'ArrowRight') seek(frame + (e.shiftKey ? FPS : 1));
    else if (e.code === 'ArrowLeft') seek(frame - (e.shiftKey ? FPS : 1));
    else if (e.code === 'Home') { pause(); show(0); }
  });

  // Automation hooks (used by tools/render and for headless QC)
  window.RAMAYANA = {
    film, svg, SCENES, TOTAL_FRAMES, FPS, W, H,
    exportVideo: (opts) => exportVideo({ film, svg, ...opts }),
    verifyPlayback, runQC, probeSupport, buildSRT, buildHitList: () => buildHitList(SCENES),
    async frameDataURL(i, type = 'image/png', q) {
      if (!this._fc) this._fc = makeFrameCanvas();
      await renderFrame(film, svg, this._fc.ctx, i);
      return this._fc.canvas.toDataURL(type, q);
    },
    ready: true,
  };
}
boot();
