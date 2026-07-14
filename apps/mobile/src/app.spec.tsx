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
import { ExpoRoot } from 'expo-router';
import requireContext from 'expo-router/build/testing-library/require-context-ponyfill';

const topicRow = { id: 'topic-1', name: 'SOLID Principles', created_at: 1000 };

const mockDb = {
  execAsync: jest.fn().mockResolvedValue(undefined),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  getAllAsync: jest.fn((sql: string) =>
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
