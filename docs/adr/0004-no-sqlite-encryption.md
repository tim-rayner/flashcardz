# 0004: No SQLite encryption — drop the unused SQLCipher config

## Status

Accepted

## Context

While auditing storage for App Store readiness, `apps/mobile/app.json`'s
`expo-sqlite` plugin config was found to set `useSQLCipher: true` (plus
`enableFTS: true` and an iOS `customBuildFlags` entry enabling
`SQLITE_ENABLE_DBSTAT_VTAB`/`SQLITE_ENABLE_SNAPSHOT`). None of this does
what it implies: `local-db.ts`'s `SQLite.openDatabaseAsync(DB_NAME)` call
passes no encryption key, so SQLCipher opens the database as plaintext —
the flag currently buys nothing but extra binary size and a false
impression, on reading `app.json`, that the local DB is encrypted. A repo
grep also turned up no FTS/virtual-table usage anywhere in the app.

The real question was whether to build out key management (e.g. an
`expo-secure-store`-backed key passed to `openDatabaseAsync`) to make the
flag true, or to remove the flag. All data in this database is local-only
and never leaves the device — sync to a server is a separate, out-of-scope
future feature backed by Postgres, not this SQLite store. iOS already
encrypts app-sandbox files at rest by default (Data Protection) once a
passcode is set, which covers the realistic threat here. SQLCipher would
only add something on top for a narrower threat (e.g. an unencrypted local
backup extraction, or a jailbroken device) that isn't a concern for this
app's data.

## Decision

Remove `useSQLCipher`, `enableFTS`, and the iOS `customBuildFlags` from the
`expo-sqlite` plugin config in `apps/mobile/app.json` entirely, rather than
adding key management to match the flag. `ios.infoPlist.
ITSAppUsesNonExemptEncryption: false` remains accurate as-is.

## Consequences

- No encryption key management (SecureStore, keychain, passphrase, etc.)
  exists or is planned for the local SQLite store.
- If a real requirement for at-rest DB encryption emerges later (e.g. this
  data starts syncing off-device, or a specific threat model is
  identified), it should be reintroduced deliberately with actual key
  management — not by re-flipping `useSQLCipher` alone, which silently
  does nothing without a key.
- `enableFTS` and the custom SQLite build flags should not be re-added
  speculatively; only add them alongside a feature that actually uses full
  text search or the corresponding SQLite APIs.
