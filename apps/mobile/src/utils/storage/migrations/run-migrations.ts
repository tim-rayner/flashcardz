import type { SQLiteDatabase } from 'expo-sqlite';
import { Migration } from './types';

async function runMigration(db: SQLiteDatabase, migration: Migration, version: number) {
  await db.execAsync('BEGIN TRANSACTION');
  try {
    await migration.up(db);
    await db.execAsync(`PRAGMA user_version = ${version}`);
    await db.execAsync('COMMIT');
  } catch (error) {
    await db.execAsync('ROLLBACK');
    throw error;
  }
}

export async function runMigrations(db: SQLiteDatabase, migrations: Migration[]) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;

  for (let index = currentVersion; index < migrations.length; index++) {
    await runMigration(db, migrations[index], index + 1);
  }
}
