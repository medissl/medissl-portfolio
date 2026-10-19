# Phase 5 — complete website integration

Started 19 October 2026 from clean `8473365` on `codex/crystal-mine-slice`. No push, merge or deployment authorized. Preserve the exact Astra environment block; the only permitted 3D change is Jellink assembly positioning.

## Milestones

- A: raise Jellink's entire wall/display assembly by 0.3 world units. Image/frame local placement, portrait proportions and clipped image-bearing stone fragments stay unchanged. Reset group height for every other station when a wall is reused. A larger trial lift occluded the portrait with the original roof; the minimal lift keeps its image clear and the name visible. No environmental geometry, material, camera, light or drill changes.
- B: migrate root, aliases and meaningful legacy deep links to the mine, preserving browser navigation and admin separation.
- C: refine interface and About with authentic Virgin Mary artwork and SAKIKO menu.
- D: restyle and safely verify admin; preserve authorization/data structures.
- E: retire only reference-checked obsolete public files, preserving original media and backend utilities.
- F: production build, route/interaction, responsive, accessibility, audio and thirteen-station regression verification.

Graphify now indexes `medissl/medissl-portfolio` at `e68b6458`, older than the local development branch. Its shared-component/auth trace was used only as a starting point; local source is authoritative. No SAKIKO graph was queried.

## Routing audit before migration

`/` is the legacy homepage, `/about` the old biography, `/work` the old archive and `/work/[slug]` the old artwork layout. The mine logo points at `/`; artwork records point to `/work/[slug]`; its archive/loading links point at `/mine?view=projects`. `SiteShell` skips the legacy header/footer only for `/mine`. Root layout globally imports old public/admin styles. Admin shares the shell/header and global utility styles, so those cannot be removed blindly. Backend helpers, storage/media records, draft preservation and RLS migrations must be retained.

## Milestone B

Root now renders the mine dynamically, with shareable project/panel URLs. `/mine` preserves its query when redirecting to root; `/work` opens Projects; `/about` opens About; `/contact` opens its contact section. `/work/[slug]` resolves published catalog content to the matching detail, including artwork galleries/process images. Unpublished, unknown and intentionally excluded Mewdi links use the new themed 404 rather than silently opening unrelated content. No database records were removed. Logo returns to SAKIKO. Public routes no longer render the legacy shell; admin remains separate. Project entries are real links supporting modifier-click/new tabs, with native overlay Back/Forward navigation. Typecheck, catalog, navigation and protected-environment checks passed; browser confirmed Projects → Jellink → Back, Virgin Mary deep link, inspection close and logo return.

The additional living-CMS requirement is a release gate: the public feed is already request-driven and the engine uses dynamic project length, but classification, admin ordering and open-tab freshness need completion and isolated publish/unpublish verification. Thirteen is the current inventory, never a permanent maximum.

## Milestone C

About now pairs the authentic Virgin Mary artwork with the actual dark SAKIKO menu. Both are full-width examples with concise creative context and working project links; Virgin Mary is shown only when present in the published catalog. Copy is shorter and top-aligned so contact links remain discoverable. Navigation/button states, serif project titles and safe-area spacing were refined. Removing the old 520px minimum height prevents bottom controls being placed outside short viewports. About → SAKIKO → browser Back and the desktop render were verified; final responsive checks follow in F. No cave visuals changed.
