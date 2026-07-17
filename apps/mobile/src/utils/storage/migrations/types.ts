import type { SQLiteDatabase } from 'expo-sqlite';

export interface Migration {
  up: (db: SQLiteDatabase) => Promise<void>;
}
