import { deleteRow, getRow, upsertRow } from './sqlite-mutations';
import { TableKeyMap, TableName, TableRowMap } from './tables';

/**
 * DAL: Data Access Layer
 * Generic entry point for reading/writing local SQLite state, covering
 * every table in schema.ts (decks, cards, sessions, card_results, settings).
 */
export class OfflineStore {
  static get<T extends TableName>(
    table: T,
    key: TableKeyMap[T],
  ): Promise<TableRowMap[T] | null> {
    return getRow(table, key);
  }

  static set<T extends TableName>(
    table: T,
    record: TableRowMap[T],
  ): Promise<void> {
    return upsertRow(table, record);
  }

  static remove<T extends TableName>(
    table: T,
    key: TableKeyMap[T],
  ): Promise<void> {
    return deleteRow(table, key);
  }
}
