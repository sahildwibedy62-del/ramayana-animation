// Export pipeline: deterministic frame rasteriser + WebCodecs encoder (H.264 → MP4, VP9/VP8 → WebM).
// Every frame is rendered from timeline time (frame / 30), so the file always has exactly 1800 frames.
import { W, H, FPS, DURATION, TOTAL_FRAMES, PAL } from './core/util.js';
import { NARRATION, HITS } from './core/timeline.js';

const US = 1e6;
const FRAME_US = US / FPS;

/** Rasterise frame `i` (SVG + canvas texture/particles) into a 1080×1920 2D context. */
export async function renderFrame(film, svg, ctx, i) {
  const t = i / FPS;
  film.render(t);
  const xml = new XMLSerializer().serializeToString(svg);
  const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml' }));
  try {
    const img = new Image(W, H);
    img.src = url;
    await img.decode();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = PAL.cream;
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(img, 0, 0, W, H);
  } finally {
    URL.revokeObjectURL(url);
  }
  film.drawOverlay(ctx, t, false);
}

export function makeFrameCanvas() {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  return { canvas: c, ctx: c.getContext('2d', { willReadFrequently: false }) };
}

// Cheap blank-frame detector: luminance variance on a 27×48 thumbnail.
const probe = document.createElement('canvas');
probe.width = 27; probe.height = 48;
const pctx = probe.getContext('2d', { willReadFrequently: true });
export function frameVariance(canvas) {
  pctx.drawImage(canvas, 0, 0, probe.width, probe.height);
  const d = pctx.getImageData(0, 0, probe.width, probe.height).data;
  let s = 0, s2 = 0, n = 0;
  for (let k = 0; k < d.length; k += 4) {
    const l = 0.299 * d[k] + 0.587 * d[k + 1] + 0.114 * d[k + 2];
    s += l; s2 += l * l; n++;
  }
  const m = s / n;
  return s2 / n - m * m;
}

const H264 = ['avc1.640028', 'avc1.4d0028', 'avc1.42002a', 'avc1.640032'];
const WEBM = [['vp09.00.40.08', 'V_VP9', 'vp9'], ['vp8', 'V_VP8', 'vp8']];

/** Which formats this browser can actually encode. */
export async function probeSupport(bitrate = 12e6) {
  const out = { webcodecs: typeof VideoEncoder !== 'undefined', mp4: null, webm: null, aac: false, opus: false };
  if (!out.webcodecs) return out;
  const base = { width: W, height: H, bitrate, framerate: FPS };
  for (const codec of H264) {
    try {
      const r = await VideoEncoder.isConfigSupported({ ...base, codec, avc: { format: 'avc' } });
      if (r.supported) { out.mp4 = { codec, label: 'H.264' }; break; }
    } catch { /* try next */ }
  }
  for (const [codec, mux, label] of WEBM) {
    try {
      const r = await VideoEncoder.isConfigSupported({ ...base, codec });
      if (r.supported) { out.webm = { codec, mux, label: label.toUpperCase() }; break; }
    } catch { /* try next */ }
  }
  if (typeof AudioEncoder !== 'undefined') {
    for (const [codec, key] of [['mp4a.40.2', 'aac'], ['opus', 'opus']]) {
      try { out[key] = (await AudioEncoder.isConfigSupported({ codec, sampleRate: 48000, numberOfChannels: 2, bitrate: 192000 })).supported; } catch { /* unsupported */ }
    }
  }
  return out;
}

async function decodeAudio(file) {
  const buf = await file.arrayBuffer();
  const ac = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, 48000 * DURATION, 48000);
  const decoded = await ac.decodeAudioData(buf);
  // Resample/trim/pad to exactly 60 s stereo @ 48 kHz by rendering through an offline graph.
  const src = ac.createBufferSource();
  src.buffer = decoded;
  src.connect(ac.destination);
  src.start(0);
  return ac.startRendering();
}

/**
 * Render and encode the whole film.
 * @returns {Promise<{blob, mime, ext, codec, frames, chunks, keyframes, blankFrames, seconds, audio}>}
 */
export async function exportVideo({ film, svg, format = 'mp4', bitrate = 12e6, audioFile = null, onProgress = () => {}, signal = null, frameRange = [0, TOTAL_FRAMES] }) {
  const sup = await probeSupport(bitrate);
  if (!sup.webcodecs) throw new Error('This browser has no WebCodecs VideoEncoder. Use Chrome/Edge 94+ or the command-line renderer (tools/render).');
  const target = format === 'mp4' ? sup.mp4 : sup.webm;
  if (!target) throw new Error(format === 'mp4' ? 'H.264 encoding is not available in this browser — choose WebM, then convert with the FFmpeg command shown.' : 'VP9/VP8 encoding is not available in this browser.');

  // ---- audio (optional) ----
  let audio = null, audioCodec = null;
  if (audioFile) {
    const want = format === 'mp4' ? (sup.aac ? ['mp4a.40.2', 'aac'] : sup.opus ? ['opus', 'opus'] : null) : sup.opus ? ['opus', 'opus'] : null;
    if (!want) throw new Error('No audio encoder (AAC/Opus) available in this browser.');
    audio = await decodeAudio(audioFile);
    audioCodec = want;
  }

  const Mux = format === 'mp4' ? await import('../vendor/mp4-muxer.mjs') : await import('../vendor/webm-muxer.mjs');
  const muxer = new Mux.Muxer({
    target: new Mux.ArrayBufferTarget(),
    video: format === 'mp4' ? { codec: 'avc', width: W, height: H, frameRate: FPS } : { codec: target.mux, width: W, height: H, frameRate: FPS },
    audio: audio ? (format === 'mp4' ? { codec: audioCodec[1], numberOfChannels: 2, sampleRate: 48000 } : { codec: 'A_OPUS', numberOfChannels: 2, sampleRate: 48000 }) : undefined,
    ...(format === 'mp4' ? { fastStart: 'in-memory', firstTimestampBehavior: 'offset' } : { firstTimestampBehavior: 'offset' }),
  });

  let encErr = null, chunks = 0, keyframes = 0;
  const venc = new VideoEncoder({
    output: (chunk, meta) => { chunks++; if (chunk.type === 'key') keyframes++; muxer.addVideoChunk(chunk, meta); },
    error: (e) => { encErr = e; },
  });
  venc.configure({ codec: target.codec, width: W, height: H, bitrate, framerate: FPS, latencyMode: 'quality', ...(format === 'mp4' ? { avc: { format: 'avc' } } : {}) });

  const { canvas, ctx } = makeFrameCanvas();
  const [f0, f1] = frameRange;
  let blankFrames = 0;
  const started = performance.now();
  for (let i = f0; i < f1; i++) {
    if (signal?.aborted) { venc.close(); throw new DOMException('Export cancelled', 'AbortError'); }
    if (encErr) throw encErr;
    await renderFrame(film, svg, ctx, i);
    if (frameVariance(canvas) < 2) blankFrames++;
    const vf = new VideoFrame(canvas, { timestamp: Math.round((i - f0) * FRAME_US), duration: Math.round(FRAME_US) });
    venc.encode(vf, { keyFrame: (i - f0) % (FPS * 2) === 0 });
    vf.close();
    while (venc.encodeQueueSize > 6) await new Promise((r) => setTimeout(r, 2));
    const done = i - f0 + 1;
    const el = (performance.now() - started) / 1000;
    onProgress({ frame: i, done, total: f1 - f0, elapsed: el, eta: (el / done) * (f1 - f0 - done), canvas });
  }
  await venc.flush();
  venc.close();
  if (encErr) throw encErr;

  let audioChunks = 0;
  if (audio) {
    const aenc = new AudioEncoder({ output: (c, m) => { audioChunks++; muxer.addAudioChunk(c, m); }, error: (e) => { encErr = e; } });
    aenc.configure({ codec: audioCodec[0], sampleRate: 48000, numberOfChannels: 2, bitrate: 192000 });
    const N = 1024 * 4;
    const L = audio.getChannelData(0), R = audio.getChannelData(1);
    for (let s = 0; s < audio.length; s += N) {
      const n = Math.min(N, audio.length - s);
      const data = new Float32Array(n * 2);
      data.set(L.subarray(s, s + n), 0);
      data.set(R.subarray(s, s + n), n);
      const ad = new AudioData({ format: 'f32-planar', sampleRate: 48000, numberOfFrames: n, numberOfChannels: 2, timestamp: Math.round((s / 48000) * US), data });
      aenc.encode(ad);
      ad.close();
    }
    await aenc.flush();
    aenc.close();
    if (encErr) throw encErr;
  }

  muxer.finalize();
  const mime = format === 'mp4' ? 'video/mp4' : 'video/webm';
  const blob = new Blob([muxer.target.buffer], { type: mime });
  return {
    blob, mime, ext: format, codec: target.codec, label: target.label, frames: f1 - f0, chunks, keyframes, blankFrames,
    seconds: (performance.now() - started) / 1000, audio: audio ? { codec: audioCodec[0], chunks: audioChunks } : null,
  };
}

/** Load the exported file in a <video> element and prove it decodes and plays. */
export function verifyPlayback(blob) {
  return new Promise((resolve) => {
    const v = document.createElement('video');
    v.muted = true; v.playsInline = true; v.preload = 'auto';
    const url = URL.createObjectURL(blob);
    const done = (r) => { v.pause(); resolve({ ...r, url }); };
    const timer = setTimeout(() => done({ ok: false, error: 'timeout while loading' }), 20000);
    v.onerror = () => { clearTimeout(timer); done({ ok: false, error: v.error ? `media error ${v.error.code}` : 'unknown' }); };
    v.onloadedmetadata = async () => {
      const meta = { duration: v.duration, width: v.videoWidth, height: v.videoHeight };
      try {
        await v.play();
        await new Promise((r) => setTimeout(r, 400));
        const played = v.currentTime > 0;
        v.currentTime = Math.max(0, v.duration - 0.5);
        await new Promise((r) => (v.onseeked = r));
        clearTimeout(timer);
        done({ ok: played, ...meta, played, seekedToEnd: true });
      } catch (e) {
        clearTimeout(timer);
        done({ ok: false, ...meta, error: String(e) });
      }
    };
    v.src = url;
  });
}

// ---------- production sidecar files ----------
const srtTime = (t) => {
  const ms = Math.round(t * 1000);
  const p = (n, l = 2) => String(n).padStart(l, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
export const buildSRT = () => NARRATION.map((n, i) => `${i + 1}\n${srtTime(n.start)} --> ${srtTime(n.end)}\n${n.text}\n`).join('\n');
export const buildHitList = (scenes) => JSON.stringify({
  fps: FPS, frames: TOTAL_FRAMES, duration: DURATION, width: W, height: H,
  scenes: scenes.map((s) => ({ id: s.id, title: s.title, start: s.start, end: s.end, startFrame: s.start * FPS, endFrame: s.end * FPS - 1, transition: s.transition })),
  narration: NARRATION, hits: HITS,
}, null, 2);

export const ffmpegCommand = (name = 'ramayana-60s.webm') =>
  `ffmpeg -i ${name} -c:v libx264 -profile:v high -pix_fmt yuv420p -r 30 -crf 16 -preset slow -c:a aac -b:a 192k -movflags +faststart ramayana-60s.mp4`;

export function download(blobOrText, name, type = 'text/plain') {
  const blob = blobOrText instanceof Blob ? blobOrText : new Blob([blobOrText], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
}
