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
