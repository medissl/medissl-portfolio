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
- B: conditional Studio editor, metadata/media management, station ordering.
- C: catalog import, verification tooling, unified loader and empty/outage states.
- D: enabled sound preference, gesture unlock, saved mute preservation, browser/regression QA.

Before approval: record verification, prepare preview and PR, provide exact preflight/backup/rollback commands. Stop before production migrations or release.
