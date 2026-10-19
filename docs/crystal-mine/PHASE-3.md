# Phase 3 — visual and interaction refinement

18–19 October 2026. Local development branch only. Preserve `3b6cb1a` (Phase 2) and `a17db6f` (verified image/stone fracture milestone).

## Direction and implementation

A welcoming mineral garden inside dark, eroded stone: warm amber and lantern pools, cooler sea-glass/lilac crystals, quieter slate surfaces, and restrained cream controls. Projects remain the focal point. The original two-tile/two-wall architecture, catalog loader, detail galleries and 4.5-second journey remain in use.

The image, border and title are painted into one fixed-size canvas per wall. Each authored stone triangle is clipped against that display rectangle, with UVs calculated in wall coordinates. Each resulting surface piece is a child of its matching stone fragment: translation and rotation cannot separate the image from the stone. No runtime physics/fracture dependency. Portrait, landscape, artwork and missing-image surfaces use the same tested coverage contract. The canvas dimensions stay fixed when changing aspect ratios, avoiding texture-storage resizing errors. Replaced surface geometries are disposed; async covers retain revision checks and a four-cover LRU.

Cracks propagate outward from the drill's contact region. The cart now approaches far enough for the actual drill tip to meet the face before fracture. The rotating bit accelerates, with a small axial action and brief, reduced camera vibration near contact. Debris retains its image portion while falling; a single bounded, softly masked impact dust cloud reveals the existing tunnel. Original fracture/travel duration and clearance hold remain. No suitable audio assets existed, so no unrelated sound or dependencies were added.

The ordinary skip button and repeated visible keyboard/status text are removed. The main UI has a project title, count and one advancement action. Instructions live in About; status announcements remain available to assistive technology. Escape, direct selection, OS reduced-motion preference and the About “Instant travel” checkbox remain available. The checkbox waits for scene readiness. Detailed galleries retain content. The decorative cart maker plaque was removed after mobile review showed it competing with the HUD.

Artwork uses a warm mat; screenshots use a dark mineral border. Original aspect ratios are fitted without cropping, including dark SAKIKO artwork and portrait Jellink/MauCuan. Missing covers remain honest named displays. Rock silhouettes and mineral surface detail were refined, wall texture UV scale corrected after rendered moiré was observed, fern leaflets narrowed and varied, crystal facets shaded, and lantern intensity/fog adjusted. Small gravel now uses simpler geometry than the large rocks. No shadows, bloom, postprocessing or real-time fracture system were added merely for decoration.

## Reference use

- [Psychonauts 2 official gallery](https://www.doublefine.com/games/psychonauts-2#screenshots) and [Questionable Area development tour](https://www.doublefine.com/news/visit-the-questionable-area): authored silhouettes, foliage groups and welcoming exploration. The gallery and its quarry imagery were inspected; no assets copied.
- [Ori official artwork](https://www.orithegame.com/): cool depth around warm focal accents. Official box art was visually inspected as a palette reference, not used as evidence of gameplay testing.
- [Bruno Simon's portfolio](https://bruno-simon.com/): interaction-led discovery with alternate access and options. Page content inspected; its scene was not benchmarked or copied.
- [Three.js BufferGeometry](https://threejs.org/docs/pages/BufferGeometry.html) and [color management](https://threejs.org/manual/pages/color-management.html): explicit geometry attributes and sRGB image surfaces. No new library needed.

## Verification

- TypeScript, ESLint, production build and existing catalog/loader/journey tests passed. New `fracture.test.mjs` checks portrait/landscape/fallback coverage, area conservation and UV alignment; journey tests now assert physical tip contact while preserving monotonic movement and final stop.
- All thirteen normal production transitions observed through drilling, breaking, travelling and arrival, including final artwork back to SAKIKO. Every station screenshot was inspected. Arrival evidence: `phase-3-journey.json`; screenshots: `screenshots/phase-3/`.
- Captured pre-impact, contact, image-bearing fractured stones and open tunnel using a local-only clock in `browser-harness.cjs`. The clock, profiling and WebGL simulations are outside application routes. They do not ship to visitors.
- Direct URL access to Jellink, index selection, clicking the actual world display, detail return/focus, missing-image detail, portrait gallery, artwork cover/gallery/process media and sticky Close checked. Three artwork images loaded at their real 1638×920 dimensions.
- Desktop 1280×720, 390×844 station/gallery, and 320×740 index inspected. Mobile-width on-screen progression, Arrow Up, Escape skip and no horizontal overflow checked. These are responsive browser tests, not physical touch-device testing.
- Instant travel exercised repeatedly through the entire catalog; separate loop evidence records rendered resource counts. OS reduced-motion preference was simulated at startup and advanced instantly. Real context loss and simulated unavailable-WebGL startup retained all thirteen project buttons with no canvas; project inspection remained usable.
- Normal browser warning/error capture was empty. Deliberately blocked WebGL produces an expected renderer error in the test harness. Some automation waits were shorter than a journey; resulting station state was inspected, then subsequent checks waited on individual phases.
- Admin, authentication, API, shared Supabase, loader, schema and production records unchanged. No authenticated CMS writes performed. Existing stale Graphify findings from Phase 2 did not substitute for local source inspection.

## Performance evidence and limits

`phase-3-performance.json` contains rolling browser frame intervals and callback durations. The first fracture pass measured 16.8 ms median / 33.4 ms p95 with two active scenes. A later single active scene at adaptive DPR measured approximately 16.7 / 16.8 ms. These conditions differ: this is not a controlled speedup claim or a GPU-duration measurement. The adaptive DPR path activated during the full journey and kept rendering viable in this browser.

Scene complexity remains bounded. Fractured image surfaces add draw calls relative to Phase 2; geometry savings from simpler small gravel offset the more refined large silhouettes. Journey and repeated-loop JSON records expose counts rather than hiding this tradeoff. Cover textures are composited into the fixed wall canvases, so their decoded LRU entries do not each become an extra uploaded image texture. Resource counts alternate with the two authored walls and different aspect ratios, rather than accumulating with visits.

The final build's complete normal journey peaked at 204 draw calls, 237,026 triangles and five uploaded renderer textures, with two walls/two tiles and at most four cached decoded covers. Two additional rendered instant-travel loops returned to the same bounded ranges. This is approximately 13% fewer peak triangles than the recorded Phase 2 journey, but more draw calls because the image now has physically separate pieces; it is not an overall speedup guarantee.

No physical devices, sustained thermal/battery behavior, GPU timing or GPU-memory bytes were measured. Renderer counts are not proof of no driver-level leak. The original light/shader budget is still substantial, and two authored chambers intentionally repeat. Native screen-reader operation has not been tested. Instant travel is a per-visit preference. Original root/artwork routes remain and `/mine` stays a noindex prototype.

Phase 4 should start with owner visual review and real-device profiling/accessibility checks, then a separate release-routing and deployment plan. Any further lighting/shadow or authored-asset work should follow those measurements. No push, merge, deployment, production route migration or production data mutation was performed.
