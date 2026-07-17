import { Migration } from './types';

export const migration0001: Migration = {
  up: async (db) => {
    await db.execAsync(`
      CREATE TABLE topics (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE cards (
        id TEXT PRIMARY KEY,
        topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        notes TEXT,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX idx_cards_topic_id ON cards(topic_id);

      CREATE TABLE sessions (
        id TEXT PRIMARY KEY,
        topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
        started_at INTEGER NOT NULL,
        completed_at INTEGER
      );
      CREATE INDEX idx_sessions_topic_id ON sessions(topic_id);

      CREATE TABLE card_results (
        session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
        result TEXT NOT NULL CHECK (result IN ('correct', 'incorrect', 'almost')),
        answered_at INTEGER NOT NULL,
        PRIMARY KEY (session_id, card_id)
      );
      CREATE INDEX idx_card_results_card_id ON card_results(card_id, answered_at);

      CREATE TABLE settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      INSERT OR IGNORE INTO settings (key, value) VALUES ('interview_mode', '0');
    `);
  },
};
