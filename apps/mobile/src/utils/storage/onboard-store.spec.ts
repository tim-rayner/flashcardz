import { getStorage } from './local-db';
import { OnboardStore } from './onboard-store';

const mockDb = {
  execAsync: jest.fn().mockResolvedValue(undefined),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  getAllAsync: jest.fn().mockResolvedValue([]),
  runAsync: jest.fn().mockResolvedValue({ changes: 1, lastInsertRowId: 0 }),
};

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve(mockDb)),
}));

describe('OnboardStore', () => {
  // getStorage() runs migrations once, on its first call, as part of opening
  // the singleton connection. Warm it up here (against the default mocks,
  // before any test queues its own mockResolvedValueOnce) so a test's first
  // real query isn't accidentally answered by the migration's own
  // PRAGMA user_version read.
  beforeAll(async () => {
    await getStorage();
  });

  beforeEach(() => {
    mockDb.execAsync.mockClear();
    mockDb.getFirstAsync.mockClear();
    mockDb.getAllAsync.mockClear();
    mockDb.runAsync.mockClear();
  });

  it('get() reads a row by its key and decodes it to the domain type, or null when none matches', async () => {
    const row = { id: 'topic-1', name: 'Spanish', created_at: 1000 };
    mockDb.getFirstAsync.mockResolvedValueOnce(row);

    await expect(OnboardStore.get('topics', { id: 'topic-1' })).resolves.toEqual({
      id: 'topic-1',
      name: 'Spanish',
      createdAt: 1000,
    });
    expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM topics WHERE id = ?'),
      ['topic-1'],
    );

    mockDb.getFirstAsync.mockResolvedValueOnce(null);
    await expect(OnboardStore.get('topics', { id: 'missing' })).resolves.toBeNull();
  });

  it('set() encodes the domain value to a row and upserts, updating only the non-key columns on conflict', async () => {
    await OnboardStore.set('topics', {
      id: 'topic-1',
      name: 'Spanish',
      createdAt: 1000,
    });

    expect(mockDb.runAsync).toHaveBeenCalledTimes(1);
    const [sql, params] = mockDb.runAsync.mock.calls[0];
    expect(sql).toContain('INSERT INTO topics (id, name, created_at)');
    expect(sql).toContain(
      'ON CONFLICT (id) DO UPDATE SET name = excluded.name, created_at = excluded.created_at',
    );
    expect(params).toEqual(['topic-1', 'Spanish', 1000]);
  });

  it('remove() deletes a row by its single-column key', async () => {
    await OnboardStore.remove('topics', { id: 'topic-1' });

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM topics WHERE id = ?'),
      ['topic-1'],
    );
  });

  it('supports the composite key on card_results for get/set/remove', async () => {
    await OnboardStore.get('card_results', { sessionId: 's1', cardId: 'c1' });
    expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining(
        'SELECT * FROM card_results WHERE session_id = ? AND card_id = ?',
      ),
      ['s1', 'c1'],
    );

    await OnboardStore.set('card_results', {
      sessionId: 's1',
      cardId: 'c1',
      result: 'correct',
      answeredAt: 2000,
    });
    const [setSql, setParams] = mockDb.runAsync.mock.calls[0];
    expect(setSql).toContain(
      'ON CONFLICT (session_id, card_id) DO UPDATE SET result = excluded.result, answered_at = excluded.answered_at',
    );
    expect(setParams).toEqual(['s1', 'c1', 'correct', 2000]);

    await OnboardStore.remove('card_results', {
      sessionId: 's1',
      cardId: 'c1',
    });
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining(
        'DELETE FROM card_results WHERE session_id = ? AND card_id = ?',
      ),
      ['s1', 'c1'],
    );
  });

  it('list() reads every row for a table and decodes each to its domain type', async () => {
    const rows = [
      { id: 'topic-1', name: 'Spanish', created_at: 1000 },
      { id: 'topic-2', name: 'French', created_at: 2000 },
    ];
    mockDb.getAllAsync.mockResolvedValueOnce(rows);

    await expect(OnboardStore.list('topics')).resolves.toEqual([
      { id: 'topic-1', name: 'Spanish', createdAt: 1000 },
      { id: 'topic-2', name: 'French', createdAt: 2000 },
    ]);
    expect(mockDb.getAllAsync).toHaveBeenCalledWith('SELECT * FROM topics');
  });

  it('list() applies an ORDER BY clause when options are given', async () => {
    mockDb.getAllAsync.mockResolvedValueOnce([]);

    await OnboardStore.list('topics', { orderBy: 'created_at', direction: 'DESC' });

    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      'SELECT * FROM topics ORDER BY created_at DESC',
    );
  });

  it('list() applies a WHERE clause and ordering when both are given', async () => {
    mockDb.getAllAsync.mockResolvedValueOnce([]);

    await OnboardStore.list('cards', {
      where: { topic_id: 'topic-1' },
      orderBy: 'created_at',
      direction: 'DESC',
    });

    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      'SELECT * FROM cards WHERE topic_id = ? ORDER BY created_at DESC',
      ['topic-1'],
    );
  });

  it('translates settings.value between the SQLite string and the domain boolean', async () => {
    mockDb.getFirstAsync.mockResolvedValueOnce({ key: 'interview_mode', value: '1' });

    await expect(
      OnboardStore.get('settings', { key: 'interview_mode' }),
    ).resolves.toEqual({ key: 'interview_mode', value: true });

    await OnboardStore.set('settings', { key: 'interview_mode', value: false });
    const [, params] = mockDb.runAsync.mock.calls[0];
    expect(params).toEqual(['interview_mode', '0']);
  });
});
