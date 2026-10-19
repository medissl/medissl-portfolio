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
