import { migration0001 } from './0001-initial';
import { Migration } from './types';

/**
 * The full, ordered history of schema migrations for the local SQLite
 * store. Add a new migration by creating a new numbered file and appending
 * it here - never by editing a migration once it has shipped. See
 * docs/adr/0003-sqlite-schema-migrations.md.
 */
export const migrations: Migration[] = [migration0001];
