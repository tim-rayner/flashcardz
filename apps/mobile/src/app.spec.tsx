/**
 * Lives beside (not inside) src/app so it is never picked up as a route
 * itself - see docs/adr/0001-expo-router-navigation.md. Renders the real
 * file-based route tree (via expo-router's own requireContext ponyfill,
 * pointed at the real src/app directory) so a route-resolution regression -
 * e.g. the "Welcome to Expo" fallback screen expo-router shows when it
 * finds zero routes, which is exactly what the src/app + Nx monorepo
 * hoisting mismatch caused - would fail this test.
 *
 * Uses `expo-router/build/testing-library/require-context-ponyfill` (a deep
 * import) rather than the documented `expo-router/testing-library` helper:
 * that package's `expect.js` unconditionally requires `expect/build/matchers`,
 * a path removed in Jest 30's `expect` package, so importing it at all
 * crashes under this repo's Jest version. The ponyfill has no such
 * dependency and is the same function `renderRouter` uses internally.
 */
import path from 'path';
// Mocks expo-linking's scheme resolution so ExpoRoot doesn't need a real
// app.json manifest in the test environment. Deep-imported (like
// require-context-ponyfill below) to avoid expo-router/testing-library's
// index, whose expect.js import crashes under Jest 30 - see the top-level
// comment in this file.
import 'expo-router/build/testing-library/mocks';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { ExpoRoot, router } from 'expo-router';
import requireContext from 'expo-router/build/testing-library/require-context-ponyfill';

const topicRow = { id: 'topic-1', name: 'SOLID Principles', created_at: 1000 };
const cardRow = {
  id: 'card-1',
  topic_id: 'topic-1',
  question: 'What is SRP?',
  answer: 'Single Responsibility Principle',
  notes: null,
  created_at: 1000,
};

const mockDb = {
  execAsync: jest.fn().mockResolvedValue(undefined),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  getAllAsync: jest.fn((sql: string): Promise<unknown[]> =>
    Promise.resolve(sql.startsWith('SELECT * FROM topics') ? [topicRow] : []),
  ),
  runAsync: jest.fn().mockResolvedValue({ changes: 1, lastInsertRowId: 0 }),
};

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve(mockDb)),
}));

function renderApp() {
  const ctx = requireContext(path.join(__dirname, 'app'));
  return render(<ExpoRoot context={ctx} />);
}

afterEach(() => {
  jest.restoreAllMocks();
});

test('the root route loads the home screen once the schema initializes', async () => {
  renderApp();

  await waitFor(() => expect(screen.getByText('Your Topics')).toBeTruthy());
});

test('tapping a topic on the home screen navigates to its detail route', async () => {
  renderApp();

  await waitFor(() => expect(screen.getByTestId('topic-card-topic-1')).toBeTruthy());

  fireEvent.press(screen.getByTestId('topic-card-topic-1'));

  await waitFor(() => expect(screen.getByTestId('empty-cards-view')).toBeTruthy());
});

test('playing a game from topic detail navigates through the game screen to the summary screen', async () => {
  mockDb.getAllAsync.mockImplementation((sql: string) => {
    if (sql.startsWith('SELECT * FROM topics')) return Promise.resolve([topicRow]);
    if (sql.startsWith('SELECT * FROM cards')) return Promise.resolve([cardRow]);
    return Promise.resolve([]);
  });
  renderApp();
  await waitFor(() => expect(screen.getByTestId('topic-card-topic-1')).toBeTruthy());
  fireEvent.press(screen.getByTestId('topic-card-topic-1'));

  await waitFor(() => expect(screen.getByTestId('start-game-button')).toBeTruthy());
  fireEvent.press(screen.getByTestId('start-game-button'));

  await waitFor(() => expect(screen.getByTestId('game-reveal-button')).toBeTruthy());
  fireEvent.press(screen.getByTestId('game-reveal-button'));
  fireEvent.press(screen.getByTestId('game-grade-correct'));

  await waitFor(() => expect(screen.getByTestId('game-summary')).toBeTruthy());
});

const abandonedSessionRow = {
  id: 'session-abandoned',
  topic_id: 'topic-1',
  started_at: 500,
  completed_at: null,
};

test('topic detail offers to resume when the topic has an abandoned game', async () => {
  mockDb.getAllAsync.mockImplementation((sql: string) => {
    if (sql.startsWith('SELECT * FROM topics')) return Promise.resolve([topicRow]);
    if (sql.startsWith('SELECT * FROM cards')) return Promise.resolve([cardRow]);
    if (sql.startsWith('SELECT * FROM sessions')) return Promise.resolve([abandonedSessionRow]);
    return Promise.resolve([]);
  });
  renderApp();
  await waitFor(() => expect(screen.getByTestId('topic-card-topic-1')).toBeTruthy());
  fireEvent.press(screen.getByTestId('topic-card-topic-1'));

  await waitFor(() => expect(screen.getByTestId('resume-game-button')).toBeTruthy());
  expect(screen.queryByTestId('start-game-button')).toBeNull();
});

test('tapping Resume game offers a choice between resuming and starting over', async () => {
  mockDb.getAllAsync.mockImplementation((sql: string) => {
    if (sql.startsWith('SELECT * FROM topics')) return Promise.resolve([topicRow]);
    if (sql.startsWith('SELECT * FROM cards')) return Promise.resolve([cardRow]);
    if (sql.startsWith('SELECT * FROM sessions')) return Promise.resolve([abandonedSessionRow]);
    return Promise.resolve([]);
  });
  renderApp();
  await waitFor(() => expect(screen.getByTestId('topic-card-topic-1')).toBeTruthy());
  fireEvent.press(screen.getByTestId('topic-card-topic-1'));
  await waitFor(() => expect(screen.getByTestId('resume-game-button')).toBeTruthy());

  fireEvent.press(screen.getByTestId('resume-game-button'));

  expect(screen.getByTestId('resume-choice-resume')).toBeTruthy();
  expect(screen.getByTestId('resume-choice-start-over')).toBeTruthy();
});

const cardRow2 = {
  id: 'card-2',
  topic_id: 'topic-1',
  question: 'What is OCP?',
  answer: 'Open/Closed Principle',
  notes: null,
  created_at: 1000,
};
const abandonedCardResultRow = {
  session_id: 'session-abandoned',
  card_id: 'card-1',
  result: 'correct',
  answered_at: 600,
};

test('choosing Resume continues the abandoned game from the next ungraded card', async () => {
  jest.spyOn(Math, 'random').mockReturnValue(0);
  mockDb.getAllAsync.mockImplementation((sql: string) => {
    if (sql.startsWith('SELECT * FROM topics')) return Promise.resolve([topicRow]);
    if (sql.startsWith('SELECT * FROM cards')) return Promise.resolve([cardRow, cardRow2]);
    if (sql.startsWith('SELECT * FROM sessions')) return Promise.resolve([abandonedSessionRow]);
    if (sql.startsWith('SELECT * FROM card_results'))
      return Promise.resolve([abandonedCardResultRow]);
    return Promise.resolve([]);
  });
  renderApp();
  await waitFor(() => expect(screen.getByTestId('topic-card-topic-1')).toBeTruthy());
  fireEvent.press(screen.getByTestId('topic-card-topic-1'));
  await waitFor(() => expect(screen.getByTestId('resume-game-button')).toBeTruthy());
  fireEvent.press(screen.getByTestId('resume-game-button'));
  fireEvent.press(screen.getByTestId('resume-choice-resume'));

  await waitFor(() => expect(screen.getByTestId('game-progress')).toBeTruthy());
  expect(screen.getByText('What is OCP?')).toBeTruthy();
  expect(screen.queryByText('What is SRP?')).toBeNull();
  // Position/total reflect the whole book (2 cards, 1 already graded before
  // the resume), not just what's left to play from this point on.
  expect(screen.getByTestId('game-progress')).toHaveTextContent('Card 2 of 2');
  expect(screen.queryByTestId('game-answer')).toBeNull();
});

test('grading a resumed card records the result against the original session and completes it', async () => {
  jest.spyOn(Math, 'random').mockReturnValue(0);
  mockDb.runAsync.mockClear();
  mockDb.getAllAsync.mockImplementation((sql: string) => {
    if (sql.startsWith('SELECT * FROM topics')) return Promise.resolve([topicRow]);
    if (sql.startsWith('SELECT * FROM cards')) return Promise.resolve([cardRow, cardRow2]);
    if (sql.startsWith('SELECT * FROM sessions')) return Promise.resolve([abandonedSessionRow]);
    if (sql.startsWith('SELECT * FROM card_results'))
      return Promise.resolve([abandonedCardResultRow]);
    return Promise.resolve([]);
  });
  mockDb.getFirstAsync.mockImplementation((sql: string) =>
    sql.startsWith('SELECT * FROM sessions')
      ? Promise.resolve(abandonedSessionRow)
      : Promise.resolve(null),
  );
  renderApp();
  await waitFor(() => expect(screen.getByTestId('topic-card-topic-1')).toBeTruthy());
  fireEvent.press(screen.getByTestId('topic-card-topic-1'));
  await waitFor(() => expect(screen.getByTestId('resume-game-button')).toBeTruthy());
  fireEvent.press(screen.getByTestId('resume-game-button'));
  fireEvent.press(screen.getByTestId('resume-choice-resume'));

  await waitFor(() => expect(screen.getByTestId('game-reveal-button')).toBeTruthy());
  fireEvent.press(screen.getByTestId('game-reveal-button'));
  fireEvent.press(screen.getByTestId('game-grade-correct'));

  await waitFor(() => expect(screen.getByTestId('game-summary')).toBeTruthy());

  const resultInsertCall = mockDb.runAsync.mock.calls.find(([sql]: [string]) =>
    sql.includes('INSERT INTO card_results'),
  );
  expect(resultInsertCall?.[1]).toEqual(
    expect.arrayContaining(['session-abandoned', 'card-2']),
  );

  const sessionCompleteCall = mockDb.runAsync.mock.calls.find(
    ([sql, params]: [string, unknown[]]) =>
      sql.includes('INSERT INTO sessions') && params[0] === 'session-abandoned',
  );
  expect(sessionCompleteCall?.[1][3]).toEqual(expect.any(Number));
});

test('choosing Start over begins a brand new game from the full card set, leaving the abandoned session untouched', async () => {
  jest.spyOn(Math, 'random').mockReturnValue(0);
  mockDb.runAsync.mockClear();
  mockDb.getAllAsync.mockImplementation((sql: string) => {
    if (sql.startsWith('SELECT * FROM topics')) return Promise.resolve([topicRow]);
    if (sql.startsWith('SELECT * FROM cards')) return Promise.resolve([cardRow, cardRow2]);
    if (sql.startsWith('SELECT * FROM sessions')) return Promise.resolve([abandonedSessionRow]);
    if (sql.startsWith('SELECT * FROM card_results'))
      return Promise.resolve([abandonedCardResultRow]);
    return Promise.resolve([]);
  });
  renderApp();
  await waitFor(() => expect(screen.getByTestId('topic-card-topic-1')).toBeTruthy());
  fireEvent.press(screen.getByTestId('topic-card-topic-1'));
  await waitFor(() => expect(screen.getByTestId('resume-game-button')).toBeTruthy());
  fireEvent.press(screen.getByTestId('resume-game-button'));
  fireEvent.press(screen.getByTestId('resume-choice-start-over'));

  await waitFor(() => expect(screen.getByTestId('game-progress')).toBeTruthy());
  expect(screen.getByTestId('game-progress')).toHaveTextContent('Card 1 of 2');

  const newSessionInsertCall = mockDb.runAsync.mock.calls.find(
    ([sql, params]: [string, unknown[]]) =>
      sql.includes('INSERT INTO sessions') && params[0] !== 'session-abandoned',
  );
  expect(newSessionInsertCall).toBeTruthy();
  const deleteCalls = mockDb.runAsync.mock.calls.filter(([sql]: [string]) =>
    sql.includes('DELETE'),
  );
  expect(deleteCalls).toHaveLength(0);
});

type Row = Record<string, unknown>;

/**
 * Backs mockDb with real in-memory tables (rather than a canned per-query
 * fixture) so a test can perform writes through the app and read its own
 * writes back - needed to reproduce bugs that only show up across multiple
 * navigations within one continuous session, not just from seeded state.
 */
function useStatefulDb(seed: { topics?: Row[]; cards?: Row[] } = {}) {
  const tables: Record<string, Row[]> = {
    topics: seed.topics ? [...seed.topics] : [],
    cards: seed.cards ? [...seed.cards] : [],
    sessions: [],
    card_results: [],
    settings: [],
  };

  function tableOf(sql: string): string {
    const match = sql.match(/(?:FROM|INTO)\s+(\w+)/);
    if (!match) throw new Error(`could not find a table name in: ${sql}`);
    return match[1];
  }

  function keysOf(table: string): string[] {
    return table === 'card_results' ? ['session_id', 'card_id'] : ['id'];
  }

  mockDb.getFirstAsync.mockImplementation((sql: string, params: unknown[] = []) => {
    const table = tableOf(sql);
    const keys = keysOf(table);
    const row = tables[table].find((r) => keys.every((key, i) => r[key] === params[i]));
    return Promise.resolve(row ?? null);
  });

  mockDb.getAllAsync.mockImplementation((sql: string, params: unknown[] = []) => {
    const table = tableOf(sql);
    let rows = tables[table];
    const whereMatch = sql.match(/WHERE (.+?)(?: ORDER BY|$)/);
    if (whereMatch) {
      const columns = whereMatch[1].split('AND').map((clause) => clause.split('=')[0].trim());
      rows = rows.filter((r) => columns.every((col, i) => r[col] === params[i]));
    }
    return Promise.resolve([...rows]);
  });

  mockDb.runAsync.mockImplementation((sql: string, params: unknown[] = []) => {
    const table = tableOf(sql);
    const keys = keysOf(table);
    if (sql.trim().startsWith('DELETE')) {
      tables[table] = tables[table].filter((r) => !keys.every((key, i) => r[key] === params[i]));
      return Promise.resolve({ changes: 1, lastInsertRowId: 0 });
    }
    const columnsMatch = sql.match(/\(([^)]+)\)\s*VALUES/);
    if (!columnsMatch) throw new Error(`could not find insert columns in: ${sql}`);
    const columns = columnsMatch[1].split(',').map((c) => c.trim());
    const record: Row = {};
    columns.forEach((col, i) => (record[col] = params[i]));
    const existingIndex = tables[table].findIndex((r) =>
      keys.every((key) => r[key] === record[key]),
    );
    if (existingIndex >= 0) tables[table][existingIndex] = record;
    else tables[table].push(record);
    return Promise.resolve({ changes: 1, lastInsertRowId: 0 });
  });

  return tables;
}

test('backing out of a game and choosing Resume continues from the next ungraded card, not from the start', async () => {
  jest.spyOn(Math, 'random').mockReturnValue(0);
  useStatefulDb({ topics: [topicRow], cards: [cardRow, cardRow2] });

  renderApp();
  await waitFor(() => expect(screen.getByTestId('topic-card-topic-1')).toBeTruthy());
  fireEvent.press(screen.getByTestId('topic-card-topic-1'));

  await waitFor(() => expect(screen.getByTestId('start-game-button')).toBeTruthy());
  fireEvent.press(screen.getByTestId('start-game-button'));

  await waitFor(() => expect(screen.getByTestId('game-reveal-button')).toBeTruthy());
  fireEvent.press(screen.getByTestId('game-reveal-button'));
  fireEvent.press(screen.getByTestId('game-grade-correct'));

  // Now on the second (still-ungraded) card - back out before finishing.
  await waitFor(() => expect(screen.getByTestId('game-progress')).toHaveTextContent('Card 2 of 2'));
  router.back();

  await waitFor(() => expect(screen.getByTestId('resume-game-button')).toBeTruthy());
  fireEvent.press(screen.getByTestId('resume-game-button'));
  fireEvent.press(screen.getByTestId('resume-choice-resume'));

  await waitFor(() => expect(screen.getByTestId('game-progress')).toBeTruthy());
  // Position/total reflect the whole book, not just what's left to play.
  expect(screen.getByTestId('game-progress')).toHaveTextContent('Card 2 of 2');
});

test('completing a game started via Start over does not leave the button assuming a stale abandoned game', async () => {
  useStatefulDb({ topics: [topicRow], cards: [cardRow] });

  renderApp();
  await waitFor(() => expect(screen.getByTestId('topic-card-topic-1')).toBeTruthy());
  fireEvent.press(screen.getByTestId('topic-card-topic-1'));

  // Start a game and abandon it immediately (before grading anything).
  await waitFor(() => expect(screen.getByTestId('start-game-button')).toBeTruthy());
  fireEvent.press(screen.getByTestId('start-game-button'));
  await waitFor(() => expect(screen.getByTestId('game-reveal-button')).toBeTruthy());
  router.back();

  // Choose Start over rather than Resume.
  await waitFor(() => expect(screen.getByTestId('resume-game-button')).toBeTruthy());
  fireEvent.press(screen.getByTestId('resume-game-button'));
  fireEvent.press(screen.getByTestId('resume-choice-start-over'));

  // Play the new game through to completion.
  await waitFor(() => expect(screen.getByTestId('game-reveal-button')).toBeTruthy());
  fireEvent.press(screen.getByTestId('game-reveal-button'));
  fireEvent.press(screen.getByTestId('game-grade-correct'));
  await waitFor(() => expect(screen.getByTestId('game-summary')).toBeTruthy());
  fireEvent.press(screen.getByTestId('summary-done'));

  // The finished game should not make the topic look like it still has
  // something to resume, even though the earlier abandoned session is
  // still sitting in the database (per the abandoned-games ADR).
  await waitFor(() => expect(screen.getByTestId('start-game-button')).toBeTruthy());
  expect(screen.queryByTestId('resume-game-button')).toBeNull();
});
