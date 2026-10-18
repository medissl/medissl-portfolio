# Portfolio direction checkpoint — 18 October 2026

Status: the owner prefers A; see [the A refinement](A-REFINEMENT.md) for the current prototype, direct repository inventory and project-first/separate-artwork direction. The three original concepts below remain historical comparison material. No publication, deployment, merge, database mutation, or CMS changes are authorized. Layout, navigation labels, headings and wording may change; project facts/media and the application/security boundaries remain authoritative.

## Why the rejected direction failed

The earlier pass treated the four CMS artwork records as the whole portfolio. It did not inspect the wider GitHub project collection before choosing a composition. That was the central information-architecture error.

It then retained a conventional introduction-first structure and used typography, asterisks, fake desk annotations and tilted artwork to signal personality. Those signals were external to the work. The headline occupied the strongest position while the actual software and games were absent. The result could be rebranded for another creative person without changing its structure.

The correction is to make project selection, project evidence and project-specific context determine the interface. A drawing should be an inspectable artwork; a game should have gameplay and implementation evidence; an application should show its interface and intended workflow. Biography belongs after visitors can understand the work.

## Actual content inspected

| Work | Evidence inspected | What it demonstrates | Presentation implication |
| --- | --- | --- | --- |
| [Jellink](https://github.com/medissl/jellink) | README, project overview, menu/gameplay captures | Original physics puzzle, custom simulation/rendering, native Java/Android and browser versions, original audio, optional online modes | Lead with actual gameplay and native screens, then explain implementation decisions. |
| [MauCuan](https://github.com/medissl/MauCuan) | README and Beranda/Miko application captures | React Native/Expo app, Indonesian interface, receipt scanning, savings goals and companion-led habits | A strong application and UI/UX entry, not an abstract capability label. |
| [Shoot a Boss](https://github.com/medissl/shoot-a-boss) | README and gameplay capture | Browser 3D FPS, game systems, progression, notebook drawing language, React/Three.js/Rapier | Its landscape gameplay image should establish the work before any personal manifesto. |
| [Wildfeast](https://github.com/medissl/wildfeast-isles-of-wonder) | README and outdoor/indoor captures | Exploration/gathering/cooking/restaurant loop, pixel-art environment, Windows game in development | Show the world and retain the in-development status. Do not imply it is a finished release. |
| [Rundori Receipt Web](https://github.com/medissl/rundori-receipt-web) | README, repository tree, actual logo | Practical order workflow, authorization, private storage and expiring receipt links | A business-software case study. No public application screenshot was available in the repository; prototypes use its real logo, not an invented dashboard or private customer receipt. |
| Creative Portfolio CMS | Local README, existing source and screenshots | Next.js/TypeScript/Supabase publishing and media management | A legitimate additional software case study; not included in the nine-entry visual subset. |
| Virgin Mary Fanart | Published Supabase record and complete artwork | Tablet illustration, biblical imagery and greyscale horror influence | Show the complete piece as a project. |
| Marina Takopi Fanart | Published record and complete artwork | A short digital character study | Keep it accessible without giving it the same explanatory weight as a large software project. |
| Mewdi pixel sprite | Published record and original PNG | Aseprite character work for the Ivy Valley work in progress | Preserve pixel sampling and its status; do not conflate Ivy Valley with Wildfeast. |
| Quick self portrait sketch | Published record and complete drawing | A five-minute traditional drawing | A concise artwork entry with appropriate context. |
| [BNCC Feedback System](https://github.com/medissl/bncc-feedback-system) | README | Express/plain-JavaScript CRUD coursework with in-memory storage | Supporting archive material; do not frame it as production-grade authenticated software. |
| Jakarta Flood AI Prediction | Linked from the [GitHub profile](https://github.com/medissl/medissl); repository README request returned 404 | Profile describes synthetic-data TensorFlow.js team coursework | Insufficient source verification for a featured prototype entry; excluded. |

The existing portfolio CMS has four published artwork records. The technical projects discovered in GitHub have not been imported into that database. The concept prototypes use a local, source-backed content subset so the owner can evaluate the presentation before deciding how to curate those records through the existing application.

## Audience and information architecture

The owner has clarified that the GitHub profile README is outdated. Its project list and career copy must not define the portfolio. For the current design, potential collaborators and employers are a working audience assumption. A first-time reviewer should see executable products and interfaces quickly, understand the owner's contribution, and then inspect technical or visual details.

Recommended hierarchy: selected projects first; full project context second; background/contact easily reachable. Software, games and artwork are browseable media types. UI/UX is demonstrated within real application/game cases rather than placed in an empty standalone category. Existing `/work`, project-detail, `/about` and admin routes must remain supported in a future implementation even if navigation and labels change.

## Reference research

These are observations and adaptations, not claims that the prototypes reproduce the reference sites.

- [David Li](https://david.li/): inspected the live image-first project grid and minimal identity/contact treatment. Work establishes personality before biography. Adapt the immediate access to varied interactive projects; do not copy the grid exactly or borrow his characters.
- [Lucas Pope](https://dukope.com/): inspected the live game catalogue. Each game is paired with concrete play, project and development-log destinations. Adapt explicit evidence and project-specific context; reject its long chronological reading burden as the main navigation for this mixed portfolio.
- [Nicky Case's archive](https://ncase.me/projects/): inspected the live cross-medium chronological project archive. It accommodates games, tools, talks and writing without forcing them into fake service categories. Adapt honest status and varied project types; do not borrow the decorative characters or long introductory copy.
- [ustwo's RVO Health case study](https://ustwo.com/work/rvo-health/): read the challenge, partnership, approach and supporting project evidence. Adapt the separation of contribution and implementation; avoid copying its agency homepage structure, marketing language or unsupported impact metrics. The live studio homepage was visually inspected as a comparison, not adopted as the composition.
- [The Pudding](https://pudding.cool/): inspected its catalogue controls and project titles/descriptions. Adapt multiple ways into real media-led work. Do not copy the stickers, decorative typography or publication branding.

Other attempted research pages were unavailable to the web tool and were not used as evidence.

## A — Visual collection (recommended)

**Entry experience:** the visitor immediately sees Jellink, MauCuan, Shoot a Boss and Wildfeast; artwork follows as artwork, not props. Phone captures remain portrait, game captures remain landscape, and drawings retain their complete composition.

**Information architecture:** a visual index, filtered by Games, Software and Artwork. Click a work to inspect its short factual context and original-project link. The prototype uses a native dialog to demonstrate quick inspection; production detail routes remain an implementation requirement after approval.

**Design system:** one sans-serif family, a pale neutral browsing surface, small persistent identity, restrained project titles, and media-specific proportions. Project colours belong to the screenshots rather than a universal decorative palette.

**Interaction philosophy:** scan, compare, choose. No timed rotation or forced narrative. The project selection is the primary action.

**Why it fits:** it provides the quickest evidence of the owner's range for an internship reviewer. Jellink's expressive physics, MauCuan's companion/interface, a 3D notebook game and pixel-art world distinguish the page without invented symbols.

**Tradeoff:** less explanation in the first view. Strong individual project pages would need to carry contribution, process and technical depth. The grid still needs deliberate curation; simply adding more thumbnails is not a design strategy.

## B — Project workbench

**Entry experience:** a named project is open in an inspection surface; a persistent project index exposes other work. Real menu/gameplay or application screens occupy the main area. Overview and Inside the build reveal factual context, contribution and implementation.

**Information architecture:** select a project, inspect its evidence, switch the level of detail. The same viewer accommodates complete art and landscape game scenes, not just phone mockups.

**Design system:** a dark navigation rail, neutral evidence panel, one sans-serif family, project-specific image fields, and clear selected/tab states. No decorative window chrome, performance gauges or fake editor code.

**Interaction philosophy:** deliberate selection and progressive disclosure, rather than scrolling through a long personal introduction. On mobile the project index becomes a horizontal selector above the content.

**Why it fits:** particularly useful for a technically curious hiring manager who wants to move between product experience and implementation. It communicates what the owner actually built.

**Tradeoff:** the visitor initially sees one project in depth. Its interface has more controls and less immediate visual breadth than A. It can feel like an application shell if the project media are not kept dominant.

## C — Guided project reel

**Entry experience:** Shoot a Boss gameplay fills the opening project surface. Its title and specific premise sit below the media. Scrolling continues through Jellink, MauCuan, Wildfeast, artwork and Rundori; project-specific process expands on request.

**Information architecture:** a curated sequence of project chapters, with Games / Applications / Artwork anchor shortcuts. Identity is small and persistent; there is no separate personal hero.

**Design system:** one sans-serif family, large complete media surfaces with colour drawn from each project, compact captions and unobtrusive disclosure. Landscape gameplay and portrait application screens set their own visual rhythm.

**Interaction philosophy:** viewing and following a story through normal document scrolling. No scroll hijacking, autoplay, loading gate or 3D navigation.

**Why it fits:** gives games and their visual worlds room to establish an expressive identity, then connects them to practical software and art through project context.

**Tradeoff:** the chosen order strongly shapes perception. It initially reads as a game portfolio, and visitors have to scroll or use anchors to discover the full range. Large media can become empty spectacle without strong chapter context.

## Recommendation after rendering

Choose A as the primary direction. The brief asks for quality and variety to emerge from actual work; A proves that variety immediately, including game development and application/UI work in the first view. It also best serves the profile's internship audience, who may initially scan rather than study a single case. B is the strongest alternative if technical depth should dominate the first interaction. C is strongest if the intended positioning becomes explicitly game-led.

The three prototypes intentionally use quiet typography so that this is a choice about composition, access and project storytelling, not a choice between three superficial colour/font treatments. None is a completed production design.

## Actual visual review and checks

- Desktop browser renders inspected for all three concepts at 1280px.
- Mobile renders inspected at 390px and 320px for all three, using a local iframe viewport selector. A also inspected at 1024px.
- Corrections: workbench project index now scrolls independently so contact/navigation are reachable; duplicate project heading and redundant navigation instructions were removed; mobile external-project link no longer wraps its arrow; the reel's opening now uses landscape gameplay to distinguish its experience from the workbench.
- A: category filter and native project dialog exercised; Escape closes the dialog and returns focus.
- B: project selection swaps actual media, contribution and technology; Inside the build switches to the matching implementation evidence.
- C: process disclosure exercised and rechecked.
- Final desktop DOM checks: no failed image loads; document width does not exceed viewport width; no captured console errors for A, B or C.
- `node --check` passed for the prototype builder and static server.
- `git diff --exit-code HEAD -- src supabase package.json package-lock.json` passed. Application source, dependencies and backend are unchanged relative to the rejected local commit.
- These checks validate the concept prototypes, not the external games/apps or a new integrated portfolio build. Static project facts were sourced from repository documentation; public screenshots may represent an earlier capture than the current release.

## Review artifacts

Open `http://localhost:4173/` while the local concept server is running, or run `node docs/design-exploration/serve.cjs` from the repository root.

- `a-collection.html`, `b-workbench.html`, `c-project-reel.html`: interactive local concepts.
- `review.html`: exact mobile/laptop viewport controls.
- `screenshots/`: three desktop and three mobile captures.
- `projects.json`, `art-records.json`: local concept content, not production CMS writes.
- `assets/`: original public media downloaded for local review. No borrowed reference-site art or regenerated substitute artwork.

Await the owner's selection before replacing application pages. Do not publish, deploy or merge.
