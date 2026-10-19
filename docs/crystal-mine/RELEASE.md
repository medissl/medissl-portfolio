# Final release candidate — 19 October 2026

## Scope and baseline

Started from clean `b5ab69c` on `codex/crystal-mine-slice`. The original approved Astra environment remains unchanged: the protected source block matches both `b55744c` and `4450f1c`. Changes to scene.ts only report elapsed time/cart speed and cancel audio on finish, skip, selection and disposal. No geometry, material, light, camera, progression, CMS, authentication or production-data changes.

## Audio diagnosis and recovery

The old controller played short motor samples and very quiet repeated impacts, only enabled cart effects in the final phase, and stopped all effect tails on every phase/configuration transition. Cart movement also occurs during the initial approach, so the sound did not follow actual movement.

The replacement uses native Web Audio, recordings decoded once, separate music/effects buses, a master compressor and short loop crossfades. Engine frames drive wheel pitch/gain, drill startup/contact, quiet unloaded rotation and arrival shutdown, crack escalation, fracture, falling debris and settling. There are no effect timers or synthetic placeholder oscillators. Hidden tabs suspend the context; panels stop effects; explicit opt-in, separate sliders and saved preferences remain. Mid-journey opt-in does not replay missed impacts. Arrival, skip, selection and disposal cancel effects; music survives ordinary phase transitions.

Final sources: Nicole Marie T’s wheel recording (CC BY 4.0), dklon’s actual cordless drill (CC BY 3.0), marvman’s masonry drilling (CC0), Bertsz’s Rock destroy (CC0), existing beardalaxy cave music (CC0), and a quiet Kenney navigation chime (CC0). Required attributions, primary source links, publicly accessible preview provenance and exact trims/processing are in public/mine/audio/CREDITS.txt. The rejected generator/mechanical proxies and generic impacts are no longer played. Cart playback is unchanged. No new runtime dependencies.

The owner approved the corrected drill/stone/cart sound through the local app and explicitly requested the quiet navigation chime. It obeys Effects/mute, plays on menu opening/project selection/closing, and never stacks.

## Verification evidence

- TypeScript, ESLint, all six crystal-mine regression scripts, normal optimized build and separate isolated CMS optimized build passed. Audio tests cover 30 full frame-driven journeys, exact cue crossings, bounded loops, persistent music, opt-in, mute, hidden/panel pause, retry and disposal races. Node reports only its existing typeless-package warning for direct TS imports.
- Real Chromium Web Audio decoding succeeded for the five core recordings. With effects 50%, music 0, sampled maximum RMS: drilling .081, fracture .235, travel .065; sampled peaks .251, .487, .244. Output returned to zero after arrival. Both sliders 100% sampled peak .918, below digital clipping. The chime is a sixth decoded asset at gain .12 versus drill gain 1.1; its panel survival, deduplication, mute and disposal are covered in tests. Final browser verification decoded all six assets, measured a quiet chime when opening Projects, and confirmed SAKIKO selection without errors. Measurements establish signal/timing/headroom, not perceptual quality; the owner supplied listening approval. The probe is injected only by cms-harness.cjs and never imported by Next.
- Browser: all thirteen stations and final-to-first progression, direct selection, natural drilling/breaking/travel, W, Escape skip, instant travel, mobile button-only journey/inspection, real project details, Virgin Mary gallery/process images, Contact and /mine aliases, excluded Mewdi unavailable page. Normal browser error log empty. Forced WebGL initialization failure in the isolated harness yielded the working archive and Jellink details.
- Rendered at 1280x720, 390x844 and 320x568; no horizontal overflow, small-screen controls remain visible. Fresh public screenshots are in screenshots/release and referenced by the real repository README.
- Read-only live catalog: thirteen stations, savedArtwork=false, Cache-Control no-store; HEAD checked nineteen distinct project-media URLs and all then-current audio files plus credits, all successful.
- Isolated Studio: signed-out guard and authenticated non-admin denial; private draft stays out of the public catalog; publish grows 13 to 14 without a rebuild; open detail receives title/cover updates; ordering saves and refreshes; a second valid gallery upload grows to 15, displays publicly, and unpublishing that inspected record returns to Projects/count 14. No production writes. One gallery test initially selected a nonexistent local filename, causing a fetch failure; reran with an existing image in a clean record and verified upload/gallery/save/unpublish. This was a test-input error, not concealed as a successful upload. Existing unrelated local draft persistence was preserved.
- Engine remains bounded at two walls and two scenery tiles. Observed full quality at 1280x720 with approximately 273k triangles and 205 draw calls at the sampled station. Physical mobile/touch hardware and sustained FPS were not measured; no environmental performance simplification was introduced.

## Release configuration and gate

Correct repository: https://github.com/medissl/medissl-portfolio, default branch main. Before release main was e68b6458bb2459823cceb9233ae1a5bed8af83fc. Existing Vercel project: prj_se1xrv8j5ABTdr5N0ntlgVtogi6O, team team_qaz8yz5uTtcB68zlvfLJYvo3, Node 24. Both required Supabase public variables already target preview and production. Values were not decrypted or modified.

Production domain: https://medissl-portfolio.vercel.app. Pre-release rollback deployment: dpl_GkAVWaTZoFTx7b3R7CyxKi3uMzcN (READY; old main). Keep this deployment and Git history until release acceptance.

The owner approved the corrected sound locally and authorized the quiet chime. A preview is still required for deployed route/render/asset verification before production promotion. Preview and production evidence will be appended once available. No production deployment is claimed by this note.
