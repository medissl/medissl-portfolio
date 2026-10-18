# Interactive multimedia direction

18 October 2026. The owner rejected A refinement's green/black palette, plain presentation and sidebar treatment, and clarified the primary identity: creative developer focused on interactive multimedia. A's project-first collection remains useful, but its quiet catalogue styling is not approved.

## Same-category references inspected live

Read the real sites in the browser and inspected their rendered output, rather than treating inspiration-gallery thumbnails as evidence.

| Reference | Observed | Adaptation for Medissl | Do not copy |
| --- | --- | --- | --- |
| [Aristide Benoist](https://aristidebenoist.com/) | Image-strip project selection, compact peripheral navigation, very strong type; opened its separate About view. Scroll response was inconsistent in this browser, so its full motion system was not verified. | Treat browsing itself as an authored visual interaction. Keep multiple projects visible while selecting a larger preview. | Its composition, compressed logotype, black palette, scrambled typography, awards or client list. |
| [Dennis Snellenberg](https://www.dennissnellenberg.com/work) | Opened homepage and Work route. Direct Work/About/Contact navigation, project index and collection controls, consistent identity across pages. | Combine expressive presentation with a quick collection and a legible site map. | His portrait hero, oversized name marquee, personal copy or exact controls. |
| [Luis Bizarro](https://bizar.ro/) | Rendered the homepage and scrolled into biography. Bespoke wordmark and direct positioning as a creative technologist; real projects explain concrete interaction/development contributions. | Coherent typography and an explicit creative-development identity. Explain contributions within project pages. | His wordmark, black palette, decorative symbols, client credentials or claims of advanced WebGL expertise not demonstrated by Medissl's work. |
| [Henry Heffernan](https://henryheffernan.com/) | Loaded its boot sequence, pressed Start and reached the rendered 3D desk entry; the embedded OS exposes About/Experience/Projects/Contact. Did not exhaustively test its experiences. | A portfolio interaction can serve as evidence of the developer's practice. | A fake operating system, required boot sequence, long entry gate or recreated 3D room. |

These references inform separate decisions. No reference media, logos, code or interface assets were copied into the prototype. Bricolage Grotesque is a separately licensed font from [Google Fonts](https://github.com/google/fonts/tree/main/ofl/bricolagegrotesque); its OFL accompanies the local font.

## Proposed approach

The home page becomes an interactive project exhibition with a visible visual selector. Selecting a thumbnail or using Previous/Next changes the large project preview, title, type, description and project destination together. The project thumbnails stay visible on desktop, so the presentation communicates breadth immediately. Collection mode keeps A's quick visual browsing available.

Use pale grey/ivory (#f0efec), deep blue ink (#293143) and cobalt (#254add), with one expressive sans-serif family. Project imagery retains its authentic colours. Green within Jellink or MauCuan screenshots is project content, not the site-wide palette. There is no fixed navigation sidebar or independently scrolling navigation area. The page uses one normal scroll flow with a thin scrollbar.

Shoot a Boss opens the exhibition, establishing an interactive/game practice through actual notebook-style gameplay. SAKIKO, Jellink, MauCuan and Wildfeast can be selected immediately. Rundori remains in the collection. Lantern Lot is linked as an early prototype. Artwork is separate and Mewdi remains omitted without deleting its record or image.

Motion is limited to project selection feedback and hover states, with reduced-motion support. There is no autoplay, sound, scroll hijacking, forced preloader or required game to reach the work.

## Connected scope

- `exhibition.html#work`: Exhibition + Collection modes.
- `exhibition.html#artwork`: three complete published drawings, each linking to its own local detail page.
- `exhibition.html#about`: owner identity, existing biographical facts, practice and contact section.
- `exhibition.html#contact`: contact destination within About.
- `exhibition-{project-id}.html`: six software/game detail pages, with real media, verified short summaries, role, stack, implementation evidence and original project links.
- `exhibition-{art-id}.html`: three artwork detail pages, with original media and medium.
- Footer Admin opens the **existing live protected CMS**, `https://medissl-portfolio.vercel.app/admin`, in another tab. Its owner sign-in screen was inspected without entering credentials or changing data. The prototype does not recreate authentication.

The actual Next.js application's `/about`, `/work`, `/work/[slug]`, `/admin` and CMS routes remain in the source tree. Their absence from the previous static concept was a prototype limitation, not removal. This connected prototype still does not replace or integrate with the application or Supabase.

## Iteration

The first exhibition render placed thumbnails below the desktop fold and looked too passive. Moved them beside the preview, with ordinary page flow rather than a fixed sidebar. The phone version uses a compact grid below the project preview. Added a quick Collection mode to prevent the presentation from slowing down project scanning.

Connected About originally allowed the browser's native hash jump to cut off the header. Separated route-state hashes from section element IDs and rechecked navigation. Skip-to-content preserves the current view.

## Review and remaining work

Open `http://localhost:4173/exhibition.html`. Responsive fixture: `review-exhibition.html`. Rebuild with `node docs/design-exploration/build-exhibition.cjs` after `build-refined.cjs` creates the shared verified content snapshot.

This is a direction prototype, not the complete integrated redesign. Authentic short gameplay clips, deeper authored case studies, any original interactive experiment and final CMS integration remain future implementation work. The prototype only demonstrates real screenshot selection and transitions; it does not claim those screenshots are live gameplay. No application source, backend, Supabase, dependency manifest, authentication or storage changes. No publication, deployment or merge.

### Verification

Rendered desktop at 1280px and embedded responsive views at 320, 390 and 1024px. Checked project selection, previous/next wraparound, Collection mode, project-page navigation, About/Artwork navigation, and separate artwork content. About transitions return to the top with navigation visible. Desktop DOM showed no horizontal overflow, all inspected images loaded, Bricolage loaded successfully, and captured browser warning/error logs were empty. Inspected the existing live admin sign-in screen without submitting a form. All inline scripts compile and local links/assets exist across ten exhibition HTML pages. Repository lint passed. No Next.js build or backend mutation checks were repeated because application source and dependencies are unchanged.
