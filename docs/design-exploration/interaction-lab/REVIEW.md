# Interaction redesign checkpoint

18 October 2026. Two isolated working prototypes on `codex/portfolio-redesign`. No Next.js application, Supabase, authentication, publishing, storage or project records were changed. No deployment, publication, merge or remote push.

## Diagnosis of the rejected exhibition

The visitor had to understand the presentation before understanding the work. Exhibition/Collection changed the browsing model. Thumbnails and Previous/Next duplicated project selection. Selecting a project changed a screenshot, while opening it required another action. Repeated captions, position counters and navigation occupied space without demonstrating interaction design. Motion was generic selection feedback rather than a coherent discovery mechanism.

Necessary actions are discover, inspect, return, and find the person/contact. The new studies remove presentation modes, thumbnail selectors, Previous/Next, counters and project-selection clicks. Both use normal links to open details and normal browser history to return. The portfolio does not require a gesture tutorial or a game to access the content.

## Reference investigation

| Reference | Inspected behavior | Lesson and boundary |
| --- | --- | --- |
| [Bruno Simon](https://bruno-simon.com/) | Attempted live WebGPU page: navigation timed out and its rendered scene could not be captured reliably. Read the official page's published keyboard, mouse, mobile and gamepad controls, quality/respawn options and technical notes. | Interaction can demonstrate the developer's practice, but an immersive world also needs recovery, input adaptation and performance choices. Do not copy the car/world or claim a completed live playtest. |
| [Active Theory](https://activetheory.net/) | Loaded its live scene, compact Work/Contact navigation and scroll prompt; scrolled and observed the spatial scene change. Activating Work raised a runtime error in this browser; complete project navigation could not be verified. | A consistent spatial language can replace many controls. Preserve clear standard destinations and graceful failure. Do not copy the logo sculpture, particle scene, audio player or unexplained navigation. |
| [Locomotive](https://locomotive.ca/en) | Accepted necessary cookies, scrolled from its media introduction into the project list, opened Lightship, inspected the case study and used browser Back. | Clear project affordances and contextual details remain valuable beneath strong art direction. Do not import its agency navigation, scrambled text, giant generic introduction or awards copy. |
| [Immersive Garden](https://immersive-g.com/) | Scrolled from its sculptural landing into content; opened See all projects and inspected the project index and Back affordance. Audio was not enabled. | Native discovery can carry visual transitions; a direct project index provides quick recognition. Do not reproduce the sculpture, material treatment, long entry sequence or subdued text contrast. |

These are observations, not claims of exhaustive desktop/mobile audits. No reference assets, code, models or logos were copied. Current source-backed project facts/media come from `../refined-content.json` and the prior direct repository inspection, not the outdated profile README. The existing licensed Bricolage font is reused with its OFL retained in `../assets/`.

## Two interaction concepts

### 1. Continuous worlds — recommended

Homepage: the first actual project is already on screen, with a compact identity and one About/contact link. Ordinary vertical scrolling exposes all featured work. There is no active-project state to manage, no selector and no next-project button.

Discovery: large project scenes follow their real media. Shoot a Boss introduces its notebook FPS, Sakiko's day/night captures establish its narrative, MauCuan introduces application/UI work, Jellink shows portrait physics-game screens and Wildfeast retains its development status. Rundori and the early Lantern Lot prototype receive supporting links. Artwork remains separate; Mewdi is omitted without deleting its original record or asset.

Opening: each project scene is one ordinary, keyboard-operable link. Its image participates in a native cross-document transition into the project detail. The detail contains role/stack/evidence and the original project destination. There is no modal or another internal slideshow.

Returning: Back to work and browser Back restore scroll position and the exact focused link. No search for the previously opened project is needed.

Motion: restrained depth follows page scrolling. Sakiko alone uses its actual daytime/nighttime captures and an optional pointer-position flashlight reveal. That effect reflects the game and gates no information. Reduced motion disables depth, image reveals and transitions. Unsupported animation APIs fall back to ordinary documents and images.

### 2. Direct index

Homepage: all project names and concise types are exposed in one list. No hero, tabs, modes or repeated project selection controls.

Discovery: pointer entry or keyboard focus changes the large adjacent preview. Every row remains a direct project link. Phone layouts put images in the rows, so there is no hover requirement or separate pane to manage.

Opening/returning: uses the same ordinary detail documents and history behavior, restoring the focused row and preview. The visible desktop preview is the transition source; the smaller row image is used on phones.

## Evaluation after browser testing

| Criterion | Continuous worlds | Direct index |
| --- | --- | --- |
| Discover the breadth | Media appears through normal scrolling; slower to reach the last work | Names visible quickly; less immediate visual context |
| Fit for games + interactive multimedia | Strong: each project's visual world and aspect ratio have room | Strong for a developer index; quieter and more administrative |
| Navigation effort | Scroll; one action to open; Back restores place | Scan/focus; one action to open; Back restores row |
| Phone use | Full-width visual sequence, no special gesture | Compact image rows, no hover dependency |
| Distinctive interaction | Project-specific reveal and continuity into detail | Responsive previews; more conventional list structure |
| Complexity | Native CSS timelines + progressive document transitions; no animation engine | Pointer/focus handlers + sticky preview; simpler |

Choose Continuous worlds for further evaluation. It better demonstrates an interactive multimedia practice while preserving normal scrolling and links. The direct index is a separate alternative, not another mode to add back into the chosen interface.

## Visual and interaction iteration

- Removed the rejected model's duplicated selectors, controls and position labels rather than moving them.
- The first responsive fixture had an oversized viewport, which exaggerated scene height. Corrected it to a measured 780px height and adjusted the phone's opening scene to let the next world appear below it.
- The direct index initially named its hidden desktop row image as the transition source. Changed it to use the visible desktop preview, retaining row images on phones.
- Real scrolling exposed a frozen animation: an inner clipped container owned the inferred timeline. Named the outer scene timeline explicitly. Measured Sakiko's daytime opacity changing from `0.361202` at scrollY 360 to `0` at scrollY 720.
- An intermediate transition frame showed duplicate title ghosts. Made the title a shared element alongside the image and separated the surrounding text fade. Reduced detail-cover height so the title remains visible on desktop.
- Back/reload testing exposed a rejected native-transition promise when navigation canceled an animation. Handle cancellation as a skipped effect, preserving the normal document navigation.
- Kept Sakiko's base image and flashlight layer geometrically aligned, instead of moving one layer independently.
- Removed a dead selector during the Ponytail pass. Kept native history, CSS animation and links; added no runtime dependency, custom scroll engine, modal manager or perpetual JavaScript animation loop.

## Verification evidence

| Check | Observed result |
| --- | --- |
| Desktop rendering | Both concepts rendered at 1280×720. Continuous page DOM width 1270px inside a 1280px viewport; no horizontal overflow or completed-image load failures in the inspected state. |
| Actual project opening | Opened Sakiko from its scene, Sakiko from the keyboard-driven index, and Shoot a Boss from the narrow viewport. |
| Exact scene return | Sakiko opened from scrollY 720. Back restored scrollY 720 and focus `open-sakiko`. |
| Keyboard index | Tab focused Shoot a Boss then Sakiko; preview changed to `sakiko`. Enter opened its detail; Tab/Enter on Back restored `open-sakiko` and the same preview. |
| Native opening transition | Browser reported the cross-document navigation transition `finished`; source/destination screenshots and rendered states inspected. |
| Pointer reveal | Actual pointer movement on Sakiko updated the light position to approximately 25.2% / 42.0%. It is optional, not a navigation requirement. |
| Scroll motion | Native scroll timeline support verified; actual scroll changed depth transform and Sakiko daytime opacity. |
| Narrow viewport | Measured 320×780 and 390×780 embedded browser viewports. Content widths were within viewport widths. Opened Shoot a Boss at 320px and returned to the original link. |
| Small laptop | Measured 1024×780 embedded viewport; both models inspected without horizontal overflow. |
| Reduced motion | Forced the same static fallback through the isolated review query: image animation names `none`, flashlight/daylight `display:none`, opening duration `0s`. Project links still opened correctly with the fallback retained. Actual OS setting was not changed. |
| Initial local load sample | One browser reload reported 224ms navigation duration and 1,951,924 transferred resource bytes at that stage. This is a single local observation, not production CWV, a cold-load benchmark or a physical-phone measurement. |
| Static checks | Generated inline scripts compile; referenced local files exist across 15 HTML documents. Shared script syntax and repository lint checked. |

The available browser-control API exposes mouse, keyboard and scrolling but no touch input or device emulation. Phone-sized document layouts and pointer-operated mobile flows were tested; **physical touch, coarse-pointer device behavior and real-device performance remain unverified**. Do not describe those as passed. The flashlight is fine-pointer-only, and all essential actions use native links and normal scrolling.

No Next.js build, authenticated write or backend mutation check was repeated because the application and dependencies are unchanged. This is a focused interaction prototype awaiting the owner's evaluation, not a completed production redesign.

## Run and review

- Start the concept server from the repository: `$env:PORT='4175'; node docs/design-exploration/serve.cjs`.
- Recommended: `http://localhost:4175/interaction-lab/worlds.html`.
- Alternative: `http://localhost:4175/interaction-lab/direct.html`.
- Comparison: `http://localhost:4175/interaction-lab/index.html`.
- Rebuild static documents: `node docs/design-exploration/interaction-lab/build.cjs`.
- Responsive/reduced-motion controls are isolated in `review.html`, not part of either portfolio's visitor interface.
