import { OfflineStore } from './offline-store';

const mockDb = {
  execAsync: jest.fn().mockResolvedValue(undefined),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  runAsync: jest.fn().mockResolvedValue({ changes: 1, lastInsertRowId: 0 }),
};

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve(mockDb)),
}));

describe('OfflineStore', () => {
  beforeEach(() => {
    mockDb.execAsync.mockClear();
    mockDb.getFirstAsync.mockClear();
    mockDb.runAsync.mockClear();
  });

  it('get() selects a row by its single-column key', async () => {
    const row = { id: 'deck-1', name: 'Spanish', created_at: 1000 };
    mockDb.getFirstAsync.mockResolvedValueOnce(row);

    const result = await OfflineStore.get('decks', { id: 'deck-1' });

    expect(result).toEqual(row);
    expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM decks WHERE id = ?'),
      ['deck-1']
    );
  });

  it('get() returns null when no row matches', async () => {
    mockDb.getFirstAsync.mockResolvedValueOnce(null);

    const result = await OfflineStore.get('decks', { id: 'missing' });

    expect(result).toBeNull();
  });

  it('set() upserts, updating only the non-key columns on conflict', async () => {
    await OfflineStore.set('decks', { id: 'deck-1', name: 'Spanish', created_at: 1000 });

    expect(mockDb.runAsync).toHaveBeenCalledTimes(1);
    const [sql, params] = mockDb.runAsync.mock.calls[0];
    expect(sql).toContain('INSERT INTO decks (id, name, created_at)');
    expect(sql).toContain(
      'ON CONFLICT (id) DO UPDATE SET name = excluded.name, created_at = excluded.created_at'
    );
    expect(params).toEqual(['deck-1', 'Spanish', 1000]);
  });

  it('remove() deletes a row by its single-column key', async () => {
    await OfflineStore.remove('decks', { id: 'deck-1' });

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM decks WHERE id = ?'),
      ['deck-1']
    );
  });

  it('supports the composite key on card_results for get/set/remove', async () => {
    await OfflineStore.get('card_results', { session_id: 's1', card_id: 'c1' });
    expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM card_results WHERE session_id = ? AND card_id = ?'),
      ['s1', 'c1']
    );

    await OfflineStore.set('card_results', {
      session_id: 's1',
      card_id: 'c1',
      result: 'correct',
      answered_at: 2000,
    });
    const [setSql, setParams] = mockDb.runAsync.mock.calls[0];
    expect(setSql).toContain(
      'ON CONFLICT (session_id, card_id) DO UPDATE SET result = excluded.result, answered_at = excluded.answered_at'
    );
    expect(setParams).toEqual(['s1', 'c1', 'correct', 2000]);

    await OfflineStore.remove('card_results', { session_id: 's1', card_id: 'c1' });
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM card_results WHERE session_id = ? AND card_id = ?'),
      ['s1', 'c1']
    );
  });
});
