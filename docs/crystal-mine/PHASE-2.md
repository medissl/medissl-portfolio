# Phase 2 checkpoint — 18 October 2026

The current direction is the crystal mine at `/mine`. Preserve Phase 1 commits b55744c and 4450f1c. Older exhibition/sketchbook notes are historical.

## Delivered

- Drill attached through a crossmember, sled, braces and bearing cradle; original movement/destruction timing preserved. Roof slabs adjusted to clear Jellink's screen.
- Ten prepared repository projects plus three currently published artworks. Mewdi excluded without changing its record. SAKIKO uses the dark menu cover; corridor and classroom remain in its gallery.
- One cached public artwork query per server render, five-second timeout and labelled saved-public-artwork fallback. Successful empty feeds stay empty. Categories, facts, portrait flags, galleries and process media preserved; nullable covers/links supported.
- Two reusable fracture walls and two scenery tiles, rebased after travel. Current/next scene covers requested, decoded-cover cache capped at four, late responses guarded. Geometry does not grow with catalog length.
- Full progression and final-to-first return, direct station URLs, index, galleries, keyboard, lightweight list and WebGL fallback. Restrained main UI with comprehensive details.

## Verification performed

- TypeScript, full ESLint, journey/catalog/loader tests and production build passed. Loader tests cover live/empty responses and returned/thrown failures.
- Production browser: all thirteen normal drilling/destruction/travel transitions, including final artwork back to SAKIKO. Arrival metrics in phase-2-journey.json: two walls/tiles, at most four cached covers and eleven renderer textures; 142–156 draw calls, 138902–272754 triangles, full quality during the recorded run.
- Direct index/URL selection, inspection/return, no-cover project, W/Arrow Up, Escape skip, on-screen advancement, portrait gallery and artwork gallery/process media checked.
- Desktop, 390px mobile and 320px index rendering checked without horizontal overflow. Sticky Close verified after scrolling artwork. Evidence: screenshots/phase-2/.
- Real WebGL context loss and simulated unavailable-WebGL startup both yielded all thirteen projects. Lightweight route and artwork inspection worked without a canvas. Simulated JavaScript reduced-motion preference advanced instantly to Jellink. Local-only browser-harness.cjs provides simulations outside application routes.
- Normal browser warning/error capture was empty. Intermittent automation timeouts were followed by inspection of resulting page state. Deliberately disabled WebGL produces an expected renderer initialization error.
- Admin/API/shared Supabase code, schema and production records unchanged. Correct Graphify index checked, but it predates the mine; local source remained authoritative.

## Limits and next milestone

Physical touch devices, sustained FPS/GPU memory and low-end hardware have not been measured. Responsive viewports are not physical-device testing. Scene counts are bounded, but the full-quality geometry/light budget needs hardware profiling. Two authored chambers intentionally repeat. Saved public artwork can become stale during an archive outage; the UI labels this fallback.

Admin/auth were preserved, not retested with authenticated writes. Root homepage and original artwork routes remain; /mine is a noindex prototype. Next: owner visual review, real-device performance/accessibility checks and an explicit routing/legacy-link plan before release.

Local milestones: 4360d68 (drill/framing), 03b25c9 (catalog/reusable scene), and the final Phase 2 integration checkpoint containing this note. No push, merge, deployment or production mutation performed.
