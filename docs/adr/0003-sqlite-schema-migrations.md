# 0003: SQLite schema migrations via PRAGMA user_version

## Status

Accepted

## Context

`initSchema()` in `apps/mobile/src/utils/storage/schema.ts` was a bare
`CREATE TABLE IF NOT EXISTS` block, run once from `_layout.tsx`'s
schema-init gate. It has no notion of versioning: any future change to an
existing table (add a column, add an index, alter a constraint) would
silently no-op against a device that already has the old shape, because
`IF NOT EXISTS` only ever fires once per table name. The app is pre-release
(no build has ever left a dev machine — no TestFlight, no real device), so
there is no legacy on-device data to migrate from today, but that stops
being true the moment this ships.

Several sub-decisions had to be made together:

- **Version tracking**: `PRAGMA user_version` (built into SQLite, atomic
  with the DB file itself) vs. a hand-rolled tracking row in `settings` or
  a dedicated table. `user_version` was chosen — it can't drift from the
  schema it describes the way a separate row could.
- **File layout**: migrations live under a new
  `apps/mobile/src/utils/storage/migrations/` directory, one numbered file
  per migration, scoped specifically to this on-device SQLite store. A
  future global Postgres-backed DB (out of scope here) will need its own,
  separate migration story — this directory is not meant to generalize to
  that.
- **Discovery**: files are wired together via a hand-maintained
  `migrations/index.ts` that imports and lists each migration explicitly,
  in order. `require.context`-based auto-discovery was considered and
  rejected — ADR 0001 already documents a production incident
  (`require.context`/`projectRoot` interacting badly with Nx's Metro
  config) caused by exactly this kind of implicit path-resolution magic.
  Migrations are rare, deliberate events; the one-line tax of listing each
  one by hand is worth it.
- **Migration shape**: each file exports `up(db: SQLiteDatabase)`, not a
  raw SQL string, so a future migration needing conditional logic or a
  data backfill doesn't require a breaking change to the `Migration` type.
- **Transactionality and direction**: each migration runs inside its own
  transaction, so a failure rolls back cleanly instead of leaving the
  schema half-upgraded. Migrations are forward-only — no `down()` — since
  there's no scenario where an Apple-distributed app needs to roll its own
  schema backward (Apple doesn't let users install an older build over a
  newer one). Instead, every migration must be additive/non-destructive
  (`ADD COLUMN`, new tables, nullable additions — never a drop/rename
  folded into the same migration that replaces something), so a botched or
  partial rollout can't strand the app looking at a schema it can't parse.
  A column that truly needs removing gets its own later cleanup migration
  once nothing depends on it.
- **Testing**: covered by mocked-db orchestration tests only (the same
  `jest.mock('expo-sqlite', ...)` + hand-rolled `mockDb` pattern already
  used in `onboard-store.spec.ts`), asserting the runner picks the right
  migrations in order, wraps each in a transaction, and bumps
  `user_version`. Pulling in a real SQLite engine (e.g. `better-sqlite3`)
  to verify actual SQL correctness was considered and rejected as
  disproportionate for an app with 5 tables and an additive-only
  convention; real SQL correctness is caught by running the app, the same
  as any other manual verification step.

## Decision

Track schema version with `PRAGMA user_version`. Migrations are numbered
files under `migrations/`, each exporting `up(db)`, listed explicitly (in
order) in a hand-maintained `migrations/index.ts`. The runner applies any
migration above the DB's current `user_version`, each inside its own
transaction, bumping `user_version` as it goes. Migration `0001` is exactly
today's `initSchema()` CREATE TABLE block (minus `IF NOT EXISTS`, since it
only ever runs once against a fresh version-0 DB). `schema.ts`/`initSchema`
are deleted rather than kept as a parallel "current shape" reference — the
migrations directory, read top to bottom, is the single source of truth
for schema history.

The migration run itself is folded into `local-db.ts`'s `getStorage()`,
inside the existing singleton `if (!db)` block, alongside the existing
`PRAGMA foreign_keys = ON`.

## Consequences

- Correctness no longer depends on every caller remembering to await some
  separate init step before touching the DB — any caller of `getStorage()`
  gets a fully-migrated DB, regardless of the `_layout.tsx` render gate.
- `_layout.tsx`'s schema-ready gate becomes a pure UX concern (don't render
  until ready) rather than a correctness one, and needs an actual error
  state added (not just a boolean) — a migration failure must surface as a
  real screen, not an infinite spinner.
- New schema changes are added by creating a new numbered file under
  `migrations/` and adding one line to `migrations/index.ts` — never by
  editing an existing migration file once it has shipped.
- Migrations must stick to additive/non-destructive SQL. A migration that
  drops or renames a column in the same step that replaces it violates this
  ADR's safety invariant and should be split into two migrations instead.
- No `down()`/rollback path exists or is planned; a bad migration is fixed
  by shipping a new forward migration, not by reverting the schema.
