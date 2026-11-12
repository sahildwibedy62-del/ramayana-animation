# Ramayana — The Epic in 60 Seconds

A 60-second, 1080×1920 (9:16, 30 fps, 1800 frames) retro editorial motion-graphics short telling the Ramayana, built entirely with HTML5, SVG, CSS and JavaScript. The look follows the provided reference boards: dense halftone dots, paper grain, screen-print misregistration, flat paper-cut layers, bold condensed italic type and a strict eight-colour palette.

## Technologies
- SVG for characters and environments, with procedural halftone patterns and print filters
- Canvas for animated grain, print specks and particles
- Plain ES modules (no build step); deterministic `render(t)` timeline (no GSAP)
- Vendored fonts (Anton, Oswald) and mp4-muxer / webm-muxer for in-browser video export via WebCodecs

## Run locally
Serve the `public/` folder with any static server, e.g. `npx serve public` or `netlify dev --port 8889`.

## Roadmap
See [PLAN.md](PLAN.md). Scenes 01–07 and the engine exist; scenes 08–10, the preview page and the export pipeline are next.
