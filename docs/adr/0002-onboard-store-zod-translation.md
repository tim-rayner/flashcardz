# Onboard store DAL translates SQLite rows through Zod

The SQLite layer (`sqlite-mutations.ts`) stays a dumb executor over snake_case rows matching the DB schema exactly; those raw row types are private to that module. `OnboardStore`'s public API deals only in camelCase domain types, produced by per-table Zod schemas (`schemas.ts`) named by convention — `GetX` decodes a row to its domain type (used by `get`), `SetX` encodes a domain type back to a row (used by `set`). Each field-level transform (rename, and where needed, type coercion like `settings.value: '0'|'1' → boolean`) is written explicitly per schema rather than derived by a generic case-converter, so the schema is the single source of truth for both the rename and any coercion together.

`settings` is modeled as a discriminated union on `key` (not a single `{key, value: boolean}` shape) since different setting keys may carry different value types; `get`/`set` are overloaded for `settings` so the return/input type narrows to the specific variant for the literal key passed.

Zod validation failures on read or write are left to throw uncaught — they only happen from a programmer error (bad encode, hand-edited DB, migration mismatch), and wrapping them would risk masking the cause.
