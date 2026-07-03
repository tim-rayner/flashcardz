import { z } from 'zod';
import {
  deleteRow,
  getRow,
  ListRowsOptions,
  listRows,
  upsertRow,
} from './sqlite-mutations';
import { TableKeyMap, TableName, TableRowMap } from './tables';
import {
  GetCard,
  GetCardResult,
  GetSession,
  GetSetting,
  GetTopic,
  SetCard,
  SetCardResult,
  SetSession,
  SetSetting,
  SetTopic,
  SettingKey,
} from './schemas';

export type Topic = z.infer<typeof GetTopic>;
export type Card = z.infer<typeof GetCard>;
export type Session = z.infer<typeof GetSession>;
export type CardResult = z.infer<typeof GetCardResult>;
export type Setting = z.infer<typeof GetSetting>;

export interface DomainMap {
  topics: Topic;
  cards: Card;
  sessions: Session;
  card_results: CardResult;
  settings: Setting;
}

export interface DomainKeyMap {
  topics: { id: string };
  cards: { id: string };
  sessions: { id: string };
  card_results: { sessionId: string; cardId: string };
  settings: { key: SettingKey };
}

const GET_SCHEMAS = {
  topics: GetTopic,
  cards: GetCard,
  sessions: GetSession,
  card_results: GetCardResult,
  settings: GetSetting,
};

const SET_SCHEMAS = {
  topics: SetTopic,
  cards: SetCard,
  sessions: SetSession,
  card_results: SetCardResult,
  settings: SetSetting,
};

function toRawKey<T extends TableName>(
  table: T,
  key: DomainKeyMap[T],
): TableKeyMap[T] {
  if (table === 'card_results') {
    const { sessionId, cardId } = key as DomainKeyMap['card_results'];
    return { session_id: sessionId, card_id: cardId } as TableKeyMap[T];
  }
  return key as unknown as TableKeyMap[T];
}

/**
 * DAL: Data Access Layer
 * Generic entry point for reading/writing local SQLite state, covering
 * every table in schema.ts (topics, cards, sessions, card_results, settings).
 * Rows are translated to/from camelCase domain types at the boundary — see
 * schemas.ts and docs/adr/0002-onboard-store-zod-translation.md.
 */
export class OnboardStore {
  static get<K extends SettingKey>(
    table: 'settings',
    key: { key: K },
  ): Promise<Extract<Setting, { key: K }> | null>;
  static get<T extends Exclude<TableName, 'settings'>>(
    table: T,
    key: DomainKeyMap[T],
  ): Promise<DomainMap[T] | null>;
  static async get<T extends TableName>(
    table: T,
    key: DomainKeyMap[T],
  ): Promise<DomainMap[T] | null> {
    const row = await getRow(table, toRawKey(table, key));
    if (row === null) return null;
    return GET_SCHEMAS[table].parse(row) as DomainMap[T];
  }

  static async set<T extends TableName>(
    table: T,
    value: DomainMap[T],
  ): Promise<void> {
    const row = SET_SCHEMAS[table].parse(value) as TableRowMap[T];
    await upsertRow(table, row);
  }

  static remove<T extends TableName>(
    table: T,
    key: DomainKeyMap[T],
  ): Promise<void> {
    return deleteRow(table, toRawKey(table, key));
  }

  static async list<T extends TableName>(
    table: T,
    options?: ListRowsOptions<T>,
  ): Promise<DomainMap[T][]> {
    const rows = await listRows(table, options);
    return rows.map((row) => GET_SCHEMAS[table].parse(row)) as DomainMap[T][];
  }
}
