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

## Studio refinement

Studio shares the type/palette tokens, retains sans-serif forms and data labels, adds clearer error/success and selected navigation states, and removes radial decoration/glow and hover layout shifts. Enlarged media delete targets and metadata, refined upload buttons, preserved all existing data handlers. Isolated optimized app browser verified owner login, non-admin denial, cover upload, draft privacy (13 stations), publish (14 stations in existing tab without rebuild) and mobile reorder. Mobile review exposed excess space in the stacked header/auth bar and an inherited oversized back-link margin; tightened these practical navigation areas and retained 44px targets. No schema, auth, query, records, audio or CMS logic changes.

## Final verification and evidence

Normal production and isolated CMS builds passed. `npx tsc --noEmit`, `npm run lint` and all six crystal-mine regression scripts passed. The exact approved environment test still matches `b55744c` and `4450f1c`. A source diff against `5061970` confirms no changes to CMS loader/API, Supabase/authentication, editor data handlers, fracture, journey or audio implementation. The only scene diff is canvas font selection; geometry, textures, material values, foliage, lighting, frame dimensions/positions and camera remain intact.

Actual optimized-build browser review covered:
- 1280x720: main HUD, SAKIKO/Jellink stations, natural drilling/fracture/cart travel, Projects, portrait game and software details, About/contact with actual Virgin Mary and dark SAKIKO menu, settings, real loading, signed-out Studio and unavailable state.
- 390x844: mine HUD, Projects, artwork detail, About/contact and signed-in Studio ordering/editor. The review led to tighter Studio header/auth/back navigation and a rechecked candidate.
- 320x568: full advance target stays within the viewport (bottom 552px), Settings scrolls without horizontal overflow.
- 1024x600: HUD target stays inside viewport (bottom 570px), archive is usable.
- All thirteen station identities were confirmed through rendered HUD updates and the final-to-first loop; W/Up, click and Escape skip work. Natural drilling, shared stone/image fracture and travel were captured separately. Two walls, two tiles, four cached covers and 160 geometries remain bounded.
- Direct selection, native Back, Escape close and modal focus containment work. Real loaded fonts were checked via FontFaceSet and computed styles. Audio enable/mute, keyboard volume adjustment and instant travel work; the audio implementation and unit checks are unchanged. Actual listening quality was not auditioned.
- Lightweight mode exposes thirteen project links and no canvas. Forced WebGL initialization failure through the local harness still yields the complete archive and functional project detail. The deliberate failure emits the expected WebGL context error; no other errors appeared in the final production browsing session. A transient development-only stylesheet hot-reload error disappeared in the optimized build.
- Isolated CMS tests used only the in-memory Supabase double: owner sign-in, non-admin denial, cover selection/upload, draft privacy, 13→14 publication without rebuilding, direct new detail, reorder, then inspected-record unpublishing safely back to Projects/count 13. Production records/policies were not mutated.

Palette calculations: ivory text on evergreen 14.30:1, secondary text 9.01:1, champagne 9.27:1, button ink on ivory surface 10.93:1. These checks support the chosen tokens; they are not a full automated accessibility certification. Physical touch devices, screen-reader hardware/software and sound quality remain owner-device acceptance checks.

Screenshots: [HUD](screenshots/luxury-refinement/mine-desktop.png), [Projects](screenshots/luxury-refinement/projects-desktop.png), [Jellink detail](screenshots/luxury-refinement/jellink-detail-desktop.png), [About](screenshots/luxury-refinement/about-desktop.png), [mobile](screenshots/luxury-refinement/mine-mobile.png), [Settings](screenshots/luxury-refinement/settings-desktop.png), [loading](screenshots/luxury-refinement/loading-desktop.png), [Studio dashboard](screenshots/luxury-refinement/studio-dashboard-desktop.png), [editor](screenshots/luxury-refinement/studio-editor-desktop.png). Other reviewed screens are in the same directory.

Local checkpoints: `af56320` reference/type evidence, `6fafece` public presentation, `02a9e05` Studio. This final evidence checkpoint also includes the mineral favicon and current DESIGN.md direction. No push, merge, deployment or production-data change. Stop here for owner visual/device acceptance; do not expand into cave redesign.
