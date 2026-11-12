# Ramayana — The Epic in 60 Seconds: Build Plan

1. [x] Vendor assets locally: Anton + Oswald fonts, mp4-muxer and webm-muxer (`public/fonts`, `public/vendor`).
2. [x] Core engine: deterministic utils/easing/RNG (`core/util.js`), SVG texture engine — halftone patterns, print filters, editorial headline/kicker/underline components (`core/textures.js`), canvas grain/specks/particles (`core/overlay.js`).
3. [x] Master timeline (`core/timeline.js`): 60 s / 1800 frames, scene-boundary validation, transitions (iris, whip, torn paper, diagonal, radial burst, bars), narration script, SFX hit list.
4. [x] Reusable character rigs (Rama, Lakshmana, Sita, Hanuman, vanara, Ravana with ten heads, golden deer, Pushpaka Vimana) and environment builders (palace, skyline, trees, hut, mountains, waves, Lanka, diyas, stones, bursts).
5. [x] Scenes 01–07 (`public/js/scenes/s01…s07`).
6. [ ] Scene 08 — The Battle of Lanka (fast cuts, arrows, impacts, orange→navy, Ravana expands).
7. [ ] Scene 09 — Victory of Dharma (arrow trail, freeze-frame, golden explosion, navy→cream).
8. [ ] Scene 10 — Return to Ayodhya (sequential diyas, pull-back, "JAI SHREE RAM" held ≥1.5 s).
9. [ ] `public/js/scenes/index.js` registering all 10 scenes; `public/index.html` + `public/css/app.css` preview UI (play/pause/restart, scrubber, timestamp, scene selector, captions).
10. [ ] Export pipeline (`public/js/export.js`): render each frame (SVG → image + canvas overlay) at 1080×1920, encode with WebCodecs H.264 → mp4-muxer (VP9 → webm-muxer fallback + FFmpeg command), exactly 1800 frames, optional audio track, SRT/hit-list download.
11. [ ] `netlify.toml` with `publish = "public"`.
12. [ ] QC pass: seek every scene, verify boundaries, faces vs. text, frame count, and that the exported file plays.
