import { getStorage } from './local-db';

export async function initSchema() {
  const db = await getStorage();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      notes TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_cards_topic_id ON cards(topic_id);

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
      started_at INTEGER NOT NULL,
      completed_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_topic_id ON sessions(topic_id);

    CREATE TABLE IF NOT EXISTS card_results (
      session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
      result TEXT NOT NULL CHECK (result IN ('correct', 'incorrect', 'almost')),
      answered_at INTEGER NOT NULL,
      PRIMARY KEY (session_id, card_id)
    );
    CREATE INDEX IF NOT EXISTS idx_card_results_card_id ON card_results(card_id, answered_at);

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    INSERT OR IGNORE INTO settings (key, value) VALUES ('interview_mode', '0');
  `);
}
