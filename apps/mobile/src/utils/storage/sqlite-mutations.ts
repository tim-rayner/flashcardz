/**
 * Generic insert/delete/read helpers used by OfflineStore. Table and column
 * identifiers are only ever pulled from the TABLES config (never from
 * caller-supplied values), so they're safe to interpolate into SQL text
 * even though the row/key values themselves are always bound as params.
 */
import { SQLiteBindValue } from 'expo-sqlite';
import { getStorage } from './local-db';
import { TABLES, TableKeyMap, TableName, TableRowMap } from './tables';

function readColumn(source: object, column: string): SQLiteBindValue {
  return (source as unknown as Record<string, SQLiteBindValue>)[column];
}

export async function getRow<T extends TableName>(
  table: T,
  key: TableKeyMap[T]
): Promise<TableRowMap[T] | null> {
  const db = await getStorage();
  const { name, keyColumns } = TABLES[table];
  const where = keyColumns.map((column) => `${column} = ?`).join(' AND ');
  const params = keyColumns.map((column) => readColumn(key, column));
  return db.getFirstAsync<TableRowMap[T]>(`SELECT * FROM ${name} WHERE ${where}`, params);
}

export async function upsertRow<T extends TableName>(
  table: T,
  record: TableRowMap[T]
): Promise<void> {
  const db = await getStorage();
  const { name, columns, keyColumns } = TABLES[table];
  const updateColumns = columns.filter((column) => !(keyColumns as readonly string[]).includes(column));

  const placeholders = columns.map(() => '?').join(', ');
  const conflictTarget = keyColumns.join(', ');
  const updateClause = updateColumns.map((column) => `${column} = excluded.${column}`).join(', ');

  const sql = `
    INSERT INTO ${name} (${columns.join(', ')})
    VALUES (${placeholders})
    ON CONFLICT (${conflictTarget}) DO UPDATE SET ${updateClause}
  `;
  const params = columns.map((column) => readColumn(record, column));
  await db.runAsync(sql, params);
}

export async function deleteRow<T extends TableName>(
  table: T,
  key: TableKeyMap[T]
): Promise<void> {
  const db = await getStorage();
  const { name, keyColumns } = TABLES[table];
  const where = keyColumns.map((column) => `${column} = ?`).join(' AND ');
  const params = keyColumns.map((column) => readColumn(key, column));
  await db.runAsync(`DELETE FROM ${name} WHERE ${where}`, params);
}
