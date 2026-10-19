# Owner correction — ceiling clearance, 19 October 2026

Raise only the central overhead stone formations in the default mine from y=7.8 to y=10.2 so they stop covering project displays (notably MauCuan and Wildfeast). Keep frames and nameplates at the normal display position. Remove the earlier Jellink-only lowering workaround so its image and nameplate return together to the same default height, as requested. Camera, other cave objects, geometry detail, materials, textures and lighting stay unchanged. Close the resulting sky gaps with overlapping copies of the same original detailed rock geometry and textured stone material, keeping their underside clear of the displays. Attach each hanging dripstone root to the actual ceiling surface. The protected test permits exactly the roof translation and the reviewed ceiling-closure block; all remaining baseline source is unchanged. This explicit owner correction supersedes the earlier prohibition only for this ceiling work.

# Current art direction — mineral gallery

The owner requested a global luxury visual refinement after Phase 5. Follow `docs/crystal-mine/LUXURY-REFINEMENT.md`: self-hosted Cormorant Garamond 400–500 display titles, DM Sans 400–600 UI/body/forms, deep evergreen surfaces, warm ivory and restrained champagne interaction accents. Use shared CSS tokens, dark neutral media wells, readable controls, composed negative space and authentic artwork. Avoid double ornamental frames, beige cards, blur/glass, generic gradients and decorative motion. Studio shares the identity but stays a practical CMS. The approved Astra environment and all mechanics, audio, dynamic publishing, authentication, data and original media are protected. Only station canvas typography changes; no geometry, lighting, material, camera or framing changes. Historical direction notes below are superseded. No push or deployment authorized.
# Current Phase 5 direction

The crystal mine at `/` is the public portfolio. Astra's original environment is approved and protected by the baseline test; only the authorized Jellink assembly lift differs. Public UI and Studio use moss, cream, brass, Georgia titles and Arial body text. About features the actual Virgin Mary fanart and SAKIKO dark menu. Published Supabase content drives reusable stations dynamically; thirteen is the current inventory, never a limit. Keep curated GitHub entries, admin/auth/RLS, media and original artwork intact. The unused legacy public component tree and blue/sketchbook styles were retired after reference checks. The older sections below document superseded explorations, not current implementation instructions. Do not push or deploy without approval.
> **APPROVED AND PROTECTED ENVIRONMENT — 19 October 2026:** the owner rejected Phase 3 environmental graphics. Astra's environment from `b55744c` / `4450f1c` is the approved baseline, restored selectively in `scene.ts`. No changes to cave geometry, materials, textures, lights, foliage, crystals or camera composition without explicit approval for that specific change. Preserve all Phase 2–3 mechanics. Remaining Phase 4 scope is UI and audio only. Read `docs/crystal-mine/PHASE-4.md`; historical notes below are superseded.

> **Current Phase 3 checkpoint:** the crystal mine at `/mine` has shared stone/image fracture, refined drilling, quieter controls and environment polish. Read `docs/crystal-mine/PHASE-3.md` for rendered verification and performance limits. Preserve the two-wall/two-tile engine and all backend/content workflows. Phase 4 requires real-device review and a separate release plan; no deployment authorized.

> **Current Phase 2 checkpoint:** the crystal mine at `/mine` supersedes the historical directions below. Read `docs/crystal-mine/PHASE-2.md` for implemented behavior and verification. Preserve the working Three.js mechanics and Supabase/admin. Local prototype only; no push, merge or deployment.

> **Current checkpoint:** the exhibition/collection interaction model is rejected. Two new isolated interaction prototypes are in `docs/design-exploration/interaction-lab/`; read `REVIEW.md` there. Recommended for owner evaluation: `worlds.html` (normal scroll discovery, one link per project, native detail/Back continuity). `direct.html` is a separate alternative, not a mode. Preserve production application/backend; do not deploy, merge, publish or push. No final visual approval has been given.

> **Latest feedback:** the owner rejects the green/black palette, plain catalogue styling and fixed sidebar. Current exploration: `docs/design-exploration/exhibition.html`, documented in `INTERACTIVE-MULTIMEDIA-DIRECTION.md` in that folder. Identity: creative developer focused on interactive multimedia. Keep project-first browsing, separate artwork, omit Mewdi, and preserve backend/admin. This local connected prototype is pending visual approval; do not deploy, publish or merge.

> **Status: owner prefers concept A; visual refinement in progress, 18 October 2026.** The working-sketchbook direction below remains rejected and historical. The current local refinement is `docs/design-exploration/a-refined.html`; read `docs/design-exploration/A-REFINEMENT.md` for its direction and verified sources. Prioritize projects, keep artwork in a separate collection, and omit Mewdi from the showcase without deleting its record. Query actual repositories for project inventory: the profile README is outdated. Layout, navigation and wording may change; preserve application routes, project facts/media, backend, Supabase and CMS workflows. Do not publish, deploy or merge.
# Medissl — the working sketchbook

## Direction

A personal studio journal at the intersection of software, games, interface design, and image-making. Warm paper (#f2f0e7), ink (#282a25), and vermilion (#b83e2b). Typography pairs a close-set system grotesk with expressive Georgia italics and small monospace captions. Use real portfolio media, uncut artwork, staggered archive compositions, and open ruled rows rather than luminous panels.

Two directions were considered: an immersive game-world portfolio and an editorial working sketchbook. The sketchbook suits the current artwork collection and leaves room for software, games, and UI/UX without creating fictional case studies or adding a 3D runtime.

## References inspected

- [Bruno Simon](https://bruno-simon.com/): the portfolio as an expression of the maker's practice; rejected an immersive game-world navigation for this content.
- [Keita Yamada](https://p5aholic.me/): inspected the restrained typography, sparse navigation, and separation of identity from experimental visuals. Do not copy its WebGL treatment or composition.
- [Pentagram](https://www.pentagram.com/): project-first presentation and editorial restraint. Use the principle of letting work establish identity, not its page composition.

## Rules

- Keep the public theme under `.public-site` in `src/app/public.css`. The legacy global and admin styles support the CMS and must remain intact.
- Preserve published content, Supabase queries, project categories, carousel order, media paths, authentication, and RLS.
- The hero collage follows actual featured/fallback records. Never substitute stock or generated artwork for the owner's work.
- Preserve the complete images using `object-fit: contain`; render Aseprite work with pixelated sampling.
- Keep all four creative disciplines visible. Do not manufacture software or game project entries to fill categories.
- Headline languages are selected explicitly; do not scramble or change readable text on a timer.
- Motion should support interaction. Pause the slideshow on hover/focus, provide pause/play, and respect reduced motion.
- Mobile is a single-column composition; carousel controls wrap instead of overflowing. At wider widths, the archive alternates the vertical placement of work.
- Use visible focus states, semantic links/buttons, pressed filter/language states, and a skip link.

## Verification record

See `docs/redesign-verification.md` for checks and known limits.
