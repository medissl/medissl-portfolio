# Unified portfolio CMS — implementation and release gate

Production baseline: `7e500ac`. Working branch: `codex/unified-portfolio-cms`.

## Model (Milestone A)

Keep `projects`, `project_media`, `admin_users`, the existing storage bucket and RLS. Add typed optional software/game metadata to projects: platform, features, repository/demo/download HTTPS URLs, action label, portrait presentation, mineral label and cover alt. Expand the category constraint without removing old categories. Existing artwork needs no rewrite. New work defaults to a private draft in Studio.

An immutable-in-Studio `legacy_key` identifies imported projects using their former station IDs. Supabase UUIDs remain primary keys. Public conversion retains these stable station IDs, so `?project=jellink` and `/work/jellink` survive title/slug edits. Regular artwork keeps its existing UUID and slug links. Gallery/process images remain in `project_media`.

Local `/mine/*.webp` paths remain deployed assets; the media resolver accepts only safe local mine image paths or existing bucket paths. Uploads continue to use the existing bucket. No copying or rewriting existing storage objects.

## Release boundary

No production writes are authorized yet. Schema and seed will be separate versioned migrations. The seed must be transactional, insert-only, idempotent, reject ambiguous existing slugs/legacy keys and seed gallery rows only when their parent is first inserted. Imported order -10…-1 preserves current artwork values/order. Mewdi stays excluded without changing its record.

The CMS-only loader requires server setting `MEDISSL_UNIFIED_CMS=true`; leave it off in production until all equivalent records/media are verified. The compatibility loader must deduplicate imported records and keep curated positions while this switch is off. Once enabled, never restore hardcoded or unpublished records on a failed feed.

## Pending milestones

- A complete: additive schema and content model; TypeScript, focused lint, protected environment test and real isolated Postgres migration/RLS tests passed. PGlite 0.5.10 is installed temporarily outside the app. The fixture supplies Supabase auth/storage primitives and grants; all repository migrations execute, except pgcrypto extension registration (built-in gen_random_uuid is used). Production inspection was SELECT-only.
- B implemented: conditional software/game metadata, drafts by default, media presentation/alt fields and numeric order. Gallery upload retries retain the new draft ID and completed media; new drafts publish only after uploads finish. Removing references preserves original storage objects and shared local assets. Atomic security-invoker reorder RPC rejects outsiders, duplicates and stale/unpublished IDs. TypeScript, full lint and isolated Postgres/RLS/reorder tests passed. Browser verification follows with the unified fixture in C/D.
- C implemented: generated insert-only seed for all ten projects and five gallery references; exact equivalence/idempotency/conflict tests pass in isolated Postgres. CMS-only feed honors all unpublishing and safe empty/outage states, preserves legacy IDs and supports downloads. Compatibility feed stays default and deduplicates imported entries. No production migration has run. Phone viewport scroll is locked only while the mine is mounted; dialogs and fallback keep internal scrolling. Typecheck, full lint, catalog and DB tests passed; rendered QA follows in D.
- D implemented and verified: sound preference defaults enabled, initializes from saved values, unlocks only within trusted pointer/key gestures, preserves explicit mute and levels. Original assets/mix unchanged. Fresh browser showed enabled with no context before interaction; first drill decoded six files and produced measured drilling/breaking/travel audio; muted reload + navigation created no context; enabled revisit resumed music after a gesture. Browser checked published software cover/two gallery uploads, conditional artwork fields, edits/order/unpublish, automatic 14→13 reconciliation, W/Escape, final→first and forced WebGL fallback. At 390×844 the root/document/body remain 844px tall and scrollTop stays 0, while the gallery dialog scrolls (402px observed) and all images load. Cave telemetry stays 35/35 attached needles, two walls/two tiles; scene.ts is unchanged.

## Verification record

TypeScript, full ESLint, six original regression scripts, isolated Postgres migration/RLS/import tests, complete optimized-app software/artwork API workflow and strict read-only import/media verifier pass. Both optimized builds pass: unified local test configuration and normal compatibility production configuration. The original `.next` cache hit a Windows EPERM lock; the normal build passed in fresh ignored `.next-cms-release` without deleting the old cache. Node emits existing harmless module-type inference notices for direct TypeScript test imports. Initial C checkpoint lint found the empty-state raw internal link; D replaced it with an explicit refresh button and full lint passed.

The strict import gate correctly rejected the test fixture after order-edit tests changed its ordering; the workflow now restores the curated fixture order before running that initial-import gate, which passes. A preview connected to the unchanged production schema must remain in compatibility mode. It cannot honestly prove production CMS-only cutover until the explicitly approved migration sequence in `CMS-RELEASE-PLAN.md` runs.

Screenshots: `screenshots/unified-cms/software-editor.png`, `screenshots/unified-cms/mobile-gallery.png` and `screenshots/unified-cms/mobile-mine.png`.

Healthy empty and failed CMS-only feeds were also rendered in the optimized app: they show distinct no-published-work/unavailable messages with refresh/contact controls, and never restore the static catalog. The fixture was returned to normal afterward. Long galleries retain internal scrolling while the fullscreen root stays locked; final mobile screenshot was captured after the resize frame completed.

Before approval: record verification, prepare preview and PR, provide exact preflight/backup/rollback commands. Stop before production migrations or release.
