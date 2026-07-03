/**
 * Row shapes and key shapes for every table in schema.ts, plus the column
 * metadata sqlite-mutations.ts needs to build queries generically.
 */

export type TableName = 'topics' | 'cards' | 'sessions' | 'card_results' | 'settings';

export interface TopicRow {
  id: string;
  name: string;
  created_at: number;
}

export interface CardRow {
  id: string;
  topic_id: string;
  question: string;
  answer: string;
  notes: string | null;
  created_at: number;
}

export interface SessionRow {
  id: string;
  topic_id: string;
  started_at: number;
  completed_at: number | null;
}

export interface CardResultRow {
  session_id: string;
  card_id: string;
  result: 'correct' | 'incorrect' | 'almost';
  answered_at: number;
}

export interface SettingRow {
  key: string;
  value: string;
}

export interface TableRowMap {
  topics: TopicRow;
  cards: CardRow;
  sessions: SessionRow;
  card_results: CardResultRow;
  settings: SettingRow;
}

export interface TableKeyMap {
  topics: Pick<TopicRow, 'id'>;
  cards: Pick<CardRow, 'id'>;
  sessions: Pick<SessionRow, 'id'>;
  card_results: Pick<CardResultRow, 'session_id' | 'card_id'>;
  settings: Pick<SettingRow, 'key'>;
}

interface TableConfig<T extends TableName> {
  name: T;
  columns: ReadonlyArray<keyof TableRowMap[T] & string>;
  keyColumns: ReadonlyArray<keyof TableKeyMap[T] & string>;
}

function defineTable<T extends TableName>(config: TableConfig<T>): TableConfig<T> {
  return config;
}

export const TABLES = {
  topics: defineTable({
    name: 'topics',
    columns: ['id', 'name', 'created_at'],
    keyColumns: ['id'],
  }),
  cards: defineTable({
    name: 'cards',
    columns: ['id', 'topic_id', 'question', 'answer', 'notes', 'created_at'],
    keyColumns: ['id'],
  }),
  sessions: defineTable({
    name: 'sessions',
    columns: ['id', 'topic_id', 'started_at', 'completed_at'],
    keyColumns: ['id'],
  }),
  card_results: defineTable({
    name: 'card_results',
    columns: ['session_id', 'card_id', 'result', 'answered_at'],
    keyColumns: ['session_id', 'card_id'],
  }),
  settings: defineTable({
    name: 'settings',
    columns: ['key', 'value'],
    keyColumns: ['key'],
  }),
} satisfies { [T in TableName]: TableConfig<T> };
