/**
 * Local SQLite DB for on-device storage.
 */
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'flashcardz-local.db';
let db: SQLite.SQLiteDatabase | null = null;

export async function getStorage() {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await db.execAsync('PRAGMA foreign_keys = ON;');
  }
  return db;
}
