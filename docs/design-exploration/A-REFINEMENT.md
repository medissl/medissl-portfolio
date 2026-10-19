# A refinement: project collection

18 October 2026. The owner prefers A's browsing structure, requests a much stronger visual treatment, wants projects prioritized, and wants Mewdi omitted. This is a local visual prototype, not the integrated application. Do not deploy, merge, publish, or mutate the CMS.

## Recommendation

Make projects the default destination. Keep artwork in a separate, clearly named collection. Drawing studies remain valuable personal work, but should not compete equally with substantial applications and games in the first screen. Demonstrate UI/UX through application screens and project context rather than creating an empty category.

Omit Mewdi from the refined presentation. Preserve the original image, record and route. The older three concepts remain historical comparison material and have not been silently rewritten.

## Corrected source of truth

The GitHub profile README is outdated according to the owner. It is not the project inventory or an authoritative statement of the owner's current employment goals. Queried the connected GitHub repository inventory directly for owner `medissl`, rather than following profile links alone. Returned repositories: bncc-feedback-system, Jakarta-Flood-AI-Prediction, medissl, medissl-portfolio, shoot-a-boss, wildfeast-isles-of-wonder, MauCuan, rundori-receipt-web, jellink-source (private; not fetched for this refinement), jellink, lantern-lot, SAKIKO. This is the connected inventory, not a claim that every personal project exists there.

- [SAKIKO README](https://github.com/medissl/SAKIKO/blob/main/README.md) and its public screenshot directory were inspected directly. First-person horror in a Japanese school, Godot/GDScript, offline Windows release, inspection/journal/checkpoint systems. The prototype uses actual menu, nighttime corridor and daytime classroom captures. No fabricated gameplay, custom assets or sole ownership of third-party assets is claimed.
- [Lantern Lot README](https://github.com/medissl/lantern-lot/blob/main/README.md) was inspected directly. It explicitly describes an early Godot secondhand-shop prototype with unfinished production assets, not a finished game. It receives a supporting development link rather than a flagship image tile.
- Previously inspected individual project repositories remain the evidence for Jellink, MauCuan, Shoot a Boss, Wildfeast and Rundori. No project records have been imported into Supabase.

## Art direction

Retain A's persistent identity/navigation rail and immediately browseable collection. Increase contrast between the quiet interface and each project's authentic visual world. A charcoal rail, sharp lime selection, near-white content plane, one sans-serif family, larger project names and varied media scale form the shared system. The lime is a navigation state, not decorative lighting applied to every project.

SAKIKO leads with a broad dark landscape and an explicit screenshot control. Jellink's two actual portrait screens counterbalance it in a narrower pale-green stage. MauCuan uses paired native screens and Shoot a Boss keeps its landscape gameplay evidence. Full illustrations appear only in Artwork. Rundori receives a compact technical entry because there is no verified public application screenshot; no dashboard or customer data was invented for visual impact.

Restrained hover movement supports inspection. Native dialogs expose context without forcing navigation away from the collection. The screenshot switch is explicit, has a live caption, and does not autoplay or add sound. Reduced-motion users receive no hover transforms. No animation library or new dependency was added.

## Visual iteration and limits

The first desktop render made Jellink visually underweighted beside SAKIKO and retained generic sidebar copy. Increased its image stage, removed the filler, and rendered again. At 320px the filters wrap onto their own line. At 390px they fit alongside the collection heading. Both preserve the project order and separate collection navigation. At 1024px, SAKIKO and Jellink remain visible together; below 900px the lead project spans the available content area and portrait applications pair below it.

This is a convincing composition study, not a promise of a particular audience reaction. The strongest further improvement is authentic short gameplay footage and richer project detail media, especially for SAKIKO's atmosphere and Jellink's simulation. Those assets should come from the actual games. Project captures, curation and well-timed interactions will contribute more than adding generic effects.

## Review

- Open `a-refined.html` for the new prototype and `review-refined.html` for 320/390/1024px embedded viewport checks.
- Local server: `node docs/design-exploration/serve.cjs`, then `http://localhost:4173/a-refined.html`.
- Rebuild prototype: `node docs/design-exploration/build-refined.cjs` (reads the historical local project data, excludes Mewdi, adds verified SAKIKO).
- Existing application, Supabase, authentication, publishing, storage, routes and dependency files are unchanged in this refinement.

## Verified in this refinement

- Rendered at 1280px and in 320/390/1024px embedded viewports; no visible clipping in the reviewed layouts. Desktop DOM width check found no horizontal overflow.
- Project/artwork navigation and separate three-piece gallery verified. Mewdi absent from the refined prototype.
- Software filter returns MauCuan and Rundori. SAKIKO screenshot switch changes both image and live caption.
- Artwork dialog opens with the correct title and medium, closes on Escape, and restores focus to its opener.
- All prototype images loaded in the desktop DOM check; captured browser warning/error log was empty.
- Builder syntax and repository lint passed. No Next.js build or backend mutation tests were repeated because application source and dependencies are unchanged.
- Saved desktop, mobile-fixture and artwork screenshots under `screenshots/a-refined-*.png`.
