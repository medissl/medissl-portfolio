# Public redesign verification — 2026-10-18

## Scope and preservation

- Replaced the public presentation with an artwork-led working sketchbook: paper, ink, vermilion, typographic wordmark, layered real artwork, ruled discipline rows, an asymmetric archive, and editorial project/About pages.
- All four currently published projects remain loaded from the existing Supabase queries. Project copy, media, categories, display order, and featured carousel order were retained.
- `git diff --exit-code origin/main -- src/lib supabase src/app/admin src/app/admin.css src/components/project-editor.tsx src/components/admin-guard.tsx` passed. No database, authentication, storage, migration, RLS, admin editor, or draft-persistence changes were made.
- Public styles are scoped under `.public-site`; the CMS keeps its existing dark theme and background.
- No dependencies or package versions were changed.

## Checks performed

- `npm run lint`: passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed, including all public and admin routes.
- `git diff --check`: passed.
- Browser: homepage, archive, category filtering and empty state, project detail with original tools/gallery, About tool accordion, 404, and admin sign-in.
- Headline controls: English, Indonesian, Chinese, Japanese, and Korean switched correctly.
- Carousel: automatic rotation, selected position, next/previous, and pause/play exercised. Focus pauses the slideshow; pointer hover suspends automatic rotation. Reduced-motion handling was reviewed in code/CSS, without changing the host OS preference.
- Keyboard: Tab exposes the skip link with a visible focus indicator. Navigation and filter states include `aria-current` / `aria-pressed`.
- Media: all four archive images loaded successfully in the browser; images retain their complete composition. Aseprite imagery uses pixelated rendering.
- Final local production homepage smoke: no captured console errors.

## Visual review

Actual browser renders were inspected at 320, 390, 768, 1024, and 1280px, using a temporary local iframe fixture for exact viewport widths. That fixture is excluded from delivery.

- Homepage: desktop, laptop, tablet, and narrow mobile compositions.
- Archive: desktop and 390px; filtering verified on desktop.
- About: desktop, 320px, and 390px; accordion exercised.
- Project detail, admin sign-in, and 404: desktop.

Important corrections from the review: removed an inherited white headline/glow, prevented carousel controls clipping at 320px, expanded the About workflow section across its wrapper, and moved artwork ahead of introductory copy on mobile. Screenshots are saved in `docs/screenshots/redesign-desktop.png` and `docs/screenshots/redesign-mobile.png`.

A development hot-reload cycle emitted one internal Next.js router initialization error while files were being replaced. It did not reproduce in the production homepage smoke test.

## Limits and follow-up

- No automated test suite is configured in this repository. Verification used lint, TypeScript, production builds, source-preservation checks, and real browser smoke tests.
- Owner-only sign-in, create/edit/publish/delete, uploads, and draft recovery were not exercised with credentials or live writes. Their implementation is unchanged; this is not a claim that authenticated write flows were retested.
- Supabase's management connector denied the read-only SQL request. The existing public API and application rendering supplied the published content; no management changes were attempted.
- Existing dependency risk: `npm audit --omit=dev` reports one high-severity vulnerable direct dependency, Next.js 16.3.6, including [the image-optimization SSRF advisory](https://github.com/advisories/GHSA-cjq9-62q9-8jv4). Dependency/security upgrades are a separate change.
- Production has not been promoted or changed by this redesign. Review the proposed branch/preview before release.
