# Ramayana — The Epic in 60 Seconds: Build Plan

1. [x] Vendor assets locally: Anton + Oswald fonts, mp4-muxer and webm-muxer (`public/fonts`, `public/vendor`).
2. [x] Core engine (`core/util.js`, `core/textures.js`, `core/overlay.js`).
3. [x] Master timeline (`core/timeline.js`) — 60 s / 1800 frames, transitions, narration, SFX hits.
4. [x] Reusable character rigs and environment builders.
5. [x] Scenes 01–07.
6. [x] Scene 08 — The Battle of Lanka.
7. [x] Scene 09 — Victory of Dharma.
8. [x] Scene 10 — Return to Ayodhya.
9. [x] Scene registry + preview UI (`index.html`, `css/app.css`, `js/app.js`).
10. [x] Export pipeline (`js/export.js`) — WebCodecs H.264 → MP4 / VP9 → WebM, playback verification, SRT + timing sheet.
11. [x] `netlify.toml` with `publish = "public"`.
12. [x] QC: headless full export produced a 1800-frame, 1080×1920, 60.00 s H.264 MP4, 0 blank frames, verified with ffmpeg.
13. [ ] Polish pass: per-scene art review on device, recorded narration/music track, optional `tools/render` CLI renderer (folder exists, empty).
