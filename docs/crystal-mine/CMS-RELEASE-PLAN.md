# Unified CMS release plan — approval required

Target: existing `medissl-portfolio` Supabase `cegtlpoofkogscvopcug`, GitHub `medissl/medissl-portfolio`, Vercel `medissl-portfolio.vercel.app`. No production writes or release are authorized by this plan. A preview/PR is preparation only.

## Preflight and backup (before any production migration)

1. Confirm approved PR head and production deployment, capture deployment IDs. Current release baseline is main `7e500ac`.
2. Ask the owner to pause Studio edits for the short cutover. Re-read all projects/media, table definitions, grants, RLS and migration history. The audit found four artwork records (three public stations plus the explicitly excluded Mewdi), and migrations `20260926122535`, `20260926123528`, `20260926152711`. These map to local `001`/`002`/`003` files; **do not blindly run `supabase db push`** with mismatched historical filenames.
3. Export all rows of `public.projects` and `public.project_media`, including drafts, to a timestamped local backup outside Git. Export column definitions, constraints, indexes, grants, policies and function definitions. Record row counts and SHA-256 checksums; parse the export and confirm all IDs/media paths. Keep credentials/admin membership out of public PR artifacts. Retain provider backup/PITR if available; verify its actual availability rather than assuming the plan includes it.
4. Save a storage object name/size manifest for `portfolio-media`; no storage objects are moved or deleted by this release. The seed references existing deployed `/mine/*.webp` assets, which remain in Git and at their original URLs.
5. Run local generation/equivalence/database tests and read-only media checks again if production or the source catalog changed. Abort on unexpected existing slug/key collisions or changed artwork counts.

## Approved execution sequence

1. Apply **only** `20261019130400_unified_portfolio_content.sql` and `20261019130635_atomic_station_order.sql` through Supabase's versioned migration API, using the exact reviewed SQL/name. No initial schema replay, table recreation, auth changes or RLS relaxation. Check column defaults, existing rows, policy definitions and reorder grants.
2. Release this PR in **compatibility mode** (`MEDISSL_UNIFIED_CMS=false`) first. It safely deduplicates imported projects and keeps the public catalog unchanged; the new editor/schema are compatible. Retain this specific deployment as the post-import rollback target.
3. Apply `20261019130926_import_curated_portfolio.sql` as a versioned migration. It inserts exactly ten deterministic UUID project records and five gallery rows, in one transaction. It updates no existing record, and changes no Mewdi/artwork visibility or order. Conflicts abort. Repeated seed execution preserves existing edits and unpublish decisions; gallery references are seeded only when their parent is first inserted.
4. Run `node docs/crystal-mine/verify-cms-import.mjs` against production using its **publishable key** (read-only), plus an authorized SQL inspection of unpublished records. Verify exact field/media equivalence, existing artwork/media IDs and paths against backup, expected 14 DB records/13 discoverable stations (if the preflight still finds four artworks), no duplicate keys, all local media HTTP 200, and old root/query/work deep links. Do not enable the new feed if any comparison fails.
5. Set the server-side release setting `MEDISSL_UNIFIED_CMS=true` and redeploy the same approved commit to production. This switch intentionally requires a deployment; **subsequent CMS publishing/editing needs no deployment**. Verify the complete CMS-only feed, 13 current stations (never a fixed cap), final-to-first, covers/fractures, admin guard, default gesture audio/mute persistence, and phone viewport bounds. Do not create disposable production test records; isolated workflow/RLS tests supply mutation coverage.
6. Resume Studio editing after smoke verification; record exact schema versions, commit and deployment IDs. Keep both the backup and compatibility deployment.

## Rollback and failure handling

- A failed schema/seed transaction rolls itself back. Stop and investigate; never delete existing artwork or retry with an overwrite/upsert.
- After a successful import, use the **new compatibility deployment from step 2**, with `MEDISSL_UNIFIED_CMS=false`, if the CMS-only application needs rollback. Keep additive columns, records and RLS intact. **Do not promote original `7e500ac` after seeding**: its old loader combines the fixed catalog with all imported rows and would duplicate stations.
- Compatibility mode temporarily uses the preserved curated catalog; CMS publish/unpublish control over imported projects resumes at the verified CMS-only release. This is a temporary rollback, not success for the CMS requirement.
- Do not remove imported rows or columns during ordinary application rollback. If data restoration becomes necessary, compare backups against current rows and obtain approval for a scoped restoration that preserves post-release edits. Full database restoration is a last resort and requires separate approval.
- Existing assets and storage objects remain available throughout. No production data deletion is part of the release or rollback.

## Verification coverage

Real isolated Postgres/PGlite executes the actual migrations/RLS and checks unauthorized writes, drafts, publishing, ordering, link constraints, import equivalence/idempotency, gallery removal preservation and conflict rollback. The local optimized Next build uses an in-memory Supabase API double for complete editor/API/upload workflows. This is explicitly not a hosted Supabase staging instance; provider-specific auth/storage behavior still receives read-only production checks and an owner smoke review after approval.
