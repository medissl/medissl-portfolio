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

## Milestone D — living CMS and admin

The public loader and no-store API read published Supabase records on every request. Open tabs refresh every minute and on focus/visibility, preserving selection by stable ID. Updates defer during travel, reuse the same renderer and two wall templates, and reconcile removed details to Projects. No fixed station cap, rebuild or terrain authoring is required. Healthy empty feeds and outages never resurrect the historical artwork snapshot; an already open page keeps its last successful collection during a transient outage. Curated GitHub entries remain available independently. Missing media has a placeholder and failed images can recover when their source changes.

Admin uses the mine palette and readable controls. Published ordering applies to all CMS categories, featuring controls menu prominence, and upload validation matches the existing 15 MiB image bucket. Existing auth, membership checks, local draft persistence, schema and storage paths remain intact. Read-only inspection of the real portfolio Supabase confirmed RLS on projects, project_media, admin_users and storage objects; public reads are published-only, writes require admin membership. No production writes or policy/schema changes were made.

Isolated browser verification uses `cms-harness.cjs` on 3005 and an optimized app build on 3006. Build/start with MEDISSL_BUILD_DIR=.next-cms-test, NEXT_PUBLIC_SUPABASE_URL=http://localhost:3005 and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=local-test-only. Start the harness first, build with those environment values, then start the same build on port 3006. Fake owner: owner@local.test / local-test-only. Other emails authenticate without admin membership. All writes stay in memory and the proxy refuses forwarding non-read requests. This is a test double, not evidence of real production mutations.

Verified through actual admin UI and app loader/API: draft remains private; publish grows 13 to 14 without rebuild; fresh slug link resolves the new station; cover and gallery upload; title/image update in an already open mine; unpublishing the inspected record returns to Projects and count 13; republishing restores 14; reordering updates the menu; signed-out guard and authenticated non-admin denial. Automatic refresh brought the original direct tab from 13 to 14 with one WebGL context. A full fourteen-station W/click + Escape cycle returned to SAKIKO with two walls, two tiles, four cached covers and one context. Typecheck and regression suite passed. Final normal-build visual and lint checks follow in F.

## Milestone E

Removed the twelve unused legacy public components (old hero, carousel, archive cards/grid, shell header/footer, ambient and decorative biography/motion components), their public.css theme, and the obsolete global blue visual rules. No active route imported these components; only hero/title and grid/card referenced each other. Kept neutral resets and extracted the CMS utility styles into admin.css, now imported by the admin layout. Existing backend query helpers, Supabase migrations, all public media, historical reference assets and design evidence remain. Updated the top of DESIGN.md to distinguish current approved direction from historical exploration rules. No dependency churn or cave changes.

## Milestone F — final verification

Normal `npm run build`, `npx tsc --noEmit`, `npm run lint`, and all six crystal-mine test scripts passed after cleanup. Node emits only the existing typeless-package warning for direct TypeScript test imports; no build/type/lint failures. Production build includes dynamic root, `/api/mine`, project slug lookup, admin and all compatibility routes. Read-only normal `/api/mine` returned the actual thirteen stations with savedArtwork=false. The environment baseline remains byte-equivalent (normalized line endings) to both approved historical checkpoints.

Final optimized-build browser checks: thirteen complete natural drilling/breaking/travelling journeys, final-to-first loop, W and Up keys, Escape skip, direct station selection, Virgin Mary full/gallery/process inspection, native Back, integrated artwork slug route, Contact alias and visible contact section, intentionally excluded Mewdi themed unavailable page, logo/navigation and lightweight archive. The archive has thirteen links and no canvas. Native dialog focus stays inside the modal; Escape restores its opener. Audio opt-in/mute and instant-travel controls work without console errors; audio unit tests verify mute, visibility pause/resume and disposal. Actual sound quality was not auditioned.

Rendered reviews at 1280x720, 1024x600, 390x844 and 320x568 showed no horizontal overflow; bottom advance controls remain inside the viewport. About and signed-out Studio were reviewed on desktop/mobile. Forced WebGL getContext failure in the isolated proxy (`?test-webgl=off`, MINE_TEST_PORT=3000) produced the full archive and working Jellink details. This injection is confined to the local test harness. Screenshots are in screenshots/phase-5.

The living-CMS release gate is verified locally against the actual optimized application with an isolated Supabase double, supported by read-only production catalog and RLS inspection. Real production publish/upload/delete mutations were deliberately not performed. Open tabs refresh every 60 seconds or on focus/visibility while idle; updates during a journey wait for a safe subsequent refresh. This is eventual refresh, not a realtime subscription. Physical touch hardware, assistive-technology and listening-quality review remain human device checks. Existing multi-row reorder saves are separate Supabase writes; an interrupted save may need a retry. No schema or production data changed, and nothing was pushed or deployed.

Phase 5 stops here. Next milestone: owner device/visual/audio acceptance followed by an explicitly approved release to the existing repository and Vercel project, with no environment redesign.
