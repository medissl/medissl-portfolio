# Phase 1 recovery — 18 October 2026

## Checkpoints and scope

`b55744c` preserves the reviewed interrupted working tree, including all untracked
mine code/media, the ten-project catalog, artwork snapshot, prior design
explorations and generated files. No secret candidates were found in the
changed/untracked text files. This first checkpoint intentionally does not build.

The recovery restores `mineProjects` as an explicit SAKIKO/Jellink selection with
required media and links. `repositoryProjects`, the prepared JSON catalogs and
`getMineProjects()` remain available but are not integrated into the prototype.
The cave, camera, cart, drill, lighting and destruction mechanics are unchanged.
No push, merge, deployment, backend mutation or production-data test was performed.

## Verification

- `node node_modules/typescript/bin/tsc --noEmit --incremental false`: passed.
- `npm run lint`: passed.
- `node --experimental-strip-types docs/crystal-mine/journey.test.mjs`: passed.
  Node emits its existing module-type warning; the assertions pass.
- `node docs/crystal-mine/stations.test.mjs`: passed. Checks the actual data
  module's two IDs, required media/links, local asset existence and preserved
  ten-entry catalog. A missing export or accidental full-catalog exposure fails.
- `npm run build`: passed, including TypeScript and route generation.
- Browser checks ran against `next start`, not a stale development bundle.
- Desktop 1280×720: cave/cart/drill rendered; W initiated drilling; the wall
  cracked and separated into fragments; travel arrived at Jellink. Both project
  detail panels and their images/links loaded. Clicking the 3D display opened
  SAKIKO. Escape closed inspection and restored focus to its opener.
- Direct selection of both stations worked. Returning to station 1 restored the
  wall and allowed another drilling sequence. Arrow Up initiated travel; both the
  skip button and Escape completed travel immediately at station 2.
- Mobile viewport 390×844: on-screen advance completed the journey; project
  inspection remained readable and scrollable. No document-width overflow;
  advance target measured about 350×53 CSS pixels. This was viewport/browser
  input testing, not a physical phone or native touchscreen test.
- About/contact and the lightweight entry worked. The latter rendered exactly
  two project buttons and no canvas. Normal-flow browser warning/error log empty.
- `browser-harness.cjs` is a localhost-only test proxy, outside the shipped app.
  Its UI triggered the real `WEBGL_lose_context` extension: the canvas was removed
  and fallback browsing remained usable, including Jellink inspection. Its reload
  test denied WebGL contexts before hydration: startup failure also showed both
  projects. A renderer error during deliberate denial is expected.

Screenshots are in `screenshots/`: recovered desktop/mobile, wall breakup,
Jellink arrival, mobile project inspection, context loss and unavailable WebGL.

## Reproduce

Build and serve with `npm run build` and `npm run start`. Open
`http://localhost:3000/mine`. Run the optional failure harness in another terminal:
`node docs/crystal-mine/browser-harness.cjs`, then open
`http://localhost:3002/__recovery`. The harness is not in `public/` and is not an
application route. Stop its process when verification is finished.

## Remaining boundaries

Station 2 still ends the journey; return through the project index is an instant
reset rather than an animated loop. Existing ceiling geometry partly covers the
top of Jellink's in-world image; the complete media is available in inspection.
These pre-existing behaviors were preserved, as requested. No new art direction,
multi-station architecture, reduced-motion emulation, hardware performance
profiling or authenticated admin mutation test was added in this phase.

Next milestone: integrate the prepared catalog into lightweight browsing first,
with explicit nullable-media handling, while retaining this verified two-station
railway until a separate progression milestone is approved.
