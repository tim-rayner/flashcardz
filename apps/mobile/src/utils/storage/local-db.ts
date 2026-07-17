/**
 * Local SQLite DB for on-device storage.
 */
import * as SQLite from 'expo-sqlite';
import { migrations } from './migrations';
import { runMigrations } from './migrations/run-migrations';

const DB_NAME = 'flashcardz-local.db';
let db: SQLite.SQLiteDatabase | null = null;

export async function getStorage() {
  if (!db) {
    const opened = await SQLite.openDatabaseAsync(DB_NAME);
    await opened.execAsync('PRAGMA foreign_keys = ON;');
    await runMigrations(opened, migrations);
    db = opened;
  }
  return db;
}
