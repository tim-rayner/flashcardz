import { renderHook, waitFor } from '@testing-library/react-native';
import { gameRepository } from '../../game/data/gameRepository';
import { OnboardStore } from '../../../utils/storage/onboard-store';
import { useTopicGameHistory } from './useTopicGameHistory';

// Only the system boundary (expo-sqlite) is faked here — OnboardStore,
// gameRepository, and useTopicGameHistory all run for real, so this proves
// (or disproves) the write-path -> read-path wiring end to end rather than
// asserting each side's mocked assumptions match the other's.
function createFakeSqliteDb() {
  const tables: Record<string, Record<string, unknown>[]> = {};
  const rowsFor = (name: string) => (tables[name] ??= []);

  function parseWhere(sql: string, params: unknown[]) {
    const match = sql.match(/WHERE\s+(.+?)(\s+ORDER BY|$)/is);
    if (!match) return (_row: Record<string, unknown>) => true;
    const columns = match[1].split(/\s+AND\s+/i).map((clause) => clause.split('=')[0].trim());
    return (row: Record<string, unknown>) =>
      columns.every((column, index) => row[column] === params[index]);
  }

  return {
    execAsync: jest.fn().mockResolvedValue(undefined),
    runAsync: jest.fn(async (sql: string, params: unknown[] = []) => {
      const insertMatch = sql.match(/INSERT INTO (\w+) \(([^)]+)\)/i);
      if (insertMatch) {
        const [, name, columnsRaw] = insertMatch;
        const columns = columnsRaw.split(',').map((c) => c.trim());
        const conflictMatch = sql.match(/ON CONFLICT \(([^)]+)\)/i);
        if (!conflictMatch) throw new Error(`Expected ON CONFLICT in SQL: ${sql}`);
        const keyColumns = conflictMatch[1].split(',').map((c) => c.trim());
        const row = Object.fromEntries(columns.map((c, i) => [c, params[i]]));
        const rows = rowsFor(name);
        const existingIndex = rows.findIndex((r) => keyColumns.every((k) => r[k] === row[k]));
        if (existingIndex >= 0) rows[existingIndex] = { ...rows[existingIndex], ...row };
        else rows.push(row);
        return { changes: 1, lastInsertRowId: 0 };
      }
      const deleteMatch = sql.match(/DELETE FROM (\w+)/i);
      if (deleteMatch) {
        const [, name] = deleteMatch;
        const predicate = parseWhere(sql, params);
        tables[name] = rowsFor(name).filter((row) => !predicate(row));
        return { changes: 1, lastInsertRowId: 0 };
      }
      throw new Error(`Unhandled SQL in fake db: ${sql}`);
    }),
    getAllAsync: jest.fn(async (sql: string, params: unknown[] = []) => {
      const selectMatch = sql.match(/SELECT \* FROM (\w+)/i);
      if (!selectMatch) throw new Error(`Expected a SELECT in SQL: ${sql}`);
      const [, name] = selectMatch;
      const predicate = parseWhere(sql, params);
      let rows = rowsFor(name).filter(predicate);
      const orderMatch = sql.match(/ORDER BY (\w+) (ASC|DESC)/i);
      if (orderMatch) {
        const [, column, direction] = orderMatch;
        rows = [...rows].sort((a, b) => {
          const diff = (a[column] as number) - (b[column] as number);
          return direction === 'DESC' ? -diff : diff;
        });
      }
      return rows;
    }),
    getFirstAsync: jest.fn(async (sql: string, params: unknown[] = []) => {
      // getStorage() reads this to decide which migrations are pending.
      // Report "already at the latest version" so the migration run is a
      // no-op here - this fake db's tables/ store is this test's schema,
      // not migration 0001's.
      if (sql === 'PRAGMA user_version') return { user_version: 1 };
      const selectMatch = sql.match(/SELECT \* FROM (\w+)/i);
      if (!selectMatch) throw new Error(`Expected a SELECT in SQL: ${sql}`);
      const [, name] = selectMatch;
      const predicate = parseWhere(sql, params);
      return rowsFor(name).find(predicate) ?? null;
    }),
  };
}

const mockFakeDb = createFakeSqliteDb();

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve(mockFakeDb)),
}));

jest.mock('expo-router', () => ({
  useFocusEffect: (callback: () => void) => {
    const { useEffect } = require('react');
    useEffect(callback, [callback]);
  },
}));

test('a completed Game recorded through gameRepository shows up in useTopicGameHistory', async () => {
  await OnboardStore.set('topics', { id: 'topic-1', name: 'Spanish', createdAt: 1 });
  await OnboardStore.set('cards', {
    id: 'card-1',
    topicId: 'topic-1',
    question: 'Hola',
    answer: 'Hello',
    notes: null,
    createdAt: 1,
  });

  await gameRepository.createSession({
    id: 'session-1',
    topicId: 'topic-1',
    startedAt: 100,
    completedAt: null,
  });
  await gameRepository.recordResult({
    sessionId: 'session-1',
    cardId: 'card-1',
    result: 'correct',
    answeredAt: 150,
  });
  await gameRepository.completeSession('session-1', 200);

  const { result } = renderHook(() => useTopicGameHistory('topic-1'));

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  expect(result.current.summary.gamesPlayed).toBe(1);
  expect(result.current.summary.entries).toHaveLength(1);
  expect(result.current.summary.entries[0].session.id).toBe('session-1');
});
