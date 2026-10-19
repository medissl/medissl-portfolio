# MEDISSL — a private collection beneath the surface

Started from clean `5061970`. This is a presentation-only refinement. The exact Astra environment, geometry and framing, Jellink position, image/stone fracture, cart/drill, progression, live CMS, audio, auth and data stay protected. No push/deploy/production writes.

## Audit and direction

The Phase 5 interface works, but its Georgia/Arial pairing feels ordinary, double outlines and inset borders compete with real cave detail, and beige artwork mats make the archive/About feel like separate products. Metadata, action links and long titles lack a shared rhythm. Admin needs the same identity with stronger task hierarchy and practical forms.

Direction: a quiet private gallery inside an atmospheric mineral world. Cormorant Garamond for project/display titles; DM Sans for body text, navigation, forms and numbers. Deep evergreen surfaces, warm ivory, desaturated champagne used on interaction/focus, dark neutral media wells. No new environmental effects, glass, faux texture, gold ornament or decorative motion. Authentic artwork supplies richness. Keep generous but purposeful margins, a controlled reading measure, smaller metadata, fine neutral separators and unmistakable controls.

## References inspected

- [Aman hotels](https://www.aman.com/hotels-and-resorts): screenshot inspected; measured type scale, wide quiet margins, image-first listings and restrained underline states. Adapt proportion, not its identity or assets.
- [Hauser & Wirth exhibitions](https://www.hauserwirth.com/hauser-wirth-exhibitions/): screenshot inspected (cookie notice partly overlaps lower viewport); strong content hierarchy and asymmetrical text/image pairing. Keep artwork uncut, avoid copying the oversized uppercase heading or dense navigation.
- [Rosewood](https://www.rosewoodhotels.com/en/default): header screenshot inspected; warm neutral ground, dark green action and delicate dividing rules. Hero had not loaded during capture; do not infer its composition.
- Official Google Fonts CSS supplied OFL-licensed font subsets. Local rendered Cormorant/DM Sans versus Bodoni/DM Sans study uses actual MEDISSL copy (screenshots/luxury-refinement/type-comparison.png). Cormorant keeps long titles composed and readable at smaller display sizes; Bodoni's heavier contrast and wider forms wrapped the same headline unnecessarily. Choose Cormorant 400–500 with DM Sans 400–600. Local Latin subsets total 74,572 bytes; system fallbacks cover other scripts. Licenses ship with the fonts.

## Milestones

1. Audit, reference/type evidence, local font assets.
2. Shared tokens and public HUD, collection, details, About/contact, settings, fallback/error/loading. Station nameplates receive typography only, outside the protected environment block; no geometry/material/mechanics change.
3. Related practical Studio typography, fields, ordering/media controls and feedback.
4. Actual desktop/mobile/laptop review, accessibility and mechanics/CMS regression checks, build/lint/types and local checkpoints.

## Public refinement

Implemented shared local typefaces/tokens, refined HUD hierarchy and visible desktop keyboard hint, simpler neutral-edged overlays, asymmetrical Projects opening row, dark media wells, consistent detail/action styling, artwork/gallery treatment, About/contact rhythm, settings, fallback/error and loading. Hover/focus states use the same champagne/ivory hierarchy. The scene diff changes only canvas font selection for titles and category labels; all geometry, material values, image UVs, wall positions and fracture logic remain untouched. Fonts load alongside the scene module, with fallback on failure. Desktop browser confirmed both fonts actually loaded. An initial About review exposed contact falling below the opening viewport; reduced title scale and contact spacing instead of removing meaningful content. Typecheck and approved environment test pass. Mobile review follows before final production verification.
