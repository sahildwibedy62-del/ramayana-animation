# AGENTS.md

Read **PLAN.md** first — it lists finished and remaining milestones.

## Architecture
- `public/js/core/util.js` — constants (W/H/FPS/DURATION, palette `PAL`), easing, `tw`/`track` tweens, seeded `rng`, `el`/`frag` SVG helpers.
- `public/js/core/textures.js` — `loadFonts()` (embeds fonts as data URLs so the SVG renders identically when rasterised for export), `buildDefs()` (halftone patterns `ht-*`, masks `m-*`, filters), `headline()`/`kicker()`/`underline()`/`animateWords()`.
- `public/js/core/overlay.js` — canvas grain, specks, particles; pure functions of time.
- `public/js/core/timeline.js` — `Film` class: builds scenes, validates contiguous boundaries totalling 60 s, `render(t)`, transitions, `drawOverlay(ctx,t)`; `NARRATION` and `HITS`.
- `public/js/assets/` — `characters.js` (rigs with `pose({...})`, `walk(phase)`) and `environments.js` (markup builders).
- `public/js/scenes/` — one module per scene: `{ id, title, start, end, transition, build({addHit}) → { node, update(lt), particles?(lt), overlay?(ctx,lt), faces, texts } }`; `kit.js` has `stage()` (camera + screen-space `top` layer), `shake`, `loopX`, `hexLerp`.

## Conventions
- Everything must be deterministic in time: no `Date.now`, no `Math.random`, no free-running rAF state. Use `rng(seed)` and local time `lt`.
- Use only `PAL` colours; ink outlines are `PAL.ink`; headlines always carry a navy offset shadow.
- Characters are only created via `makeCharacter`/`makeRavana`/`makeDeer` so designs stay consistent.
- Typography goes in `st.top` (unaffected by camera) and must not overlap faces.
- No build step; the site is static from `public/`.

## Preview & export
- `public/js/scenes/index.js` registers the 10 scenes; `public/js/app.js` drives the preview UI and exposes `window.RAMAYANA` (exportVideo, frameDataURL, runQC) for headless automation.
- `public/js/export.js` rasterises each frame (serialised SVG → image + canvas overlay) and encodes with WebCodecs; MP4 needs a browser with H.264 VideoEncoder (Chrome/Edge), otherwise WebM + the FFmpeg command shown in the UI.
- Note: `tornEdgePath` lives in `core/textures.js` (timeline.js imports it from there).
