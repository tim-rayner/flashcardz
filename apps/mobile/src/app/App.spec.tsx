import { render, waitFor } from '@testing-library/react-native';
import App from './App';

const mockDb = {
  execAsync: jest.fn().mockResolvedValue(undefined),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  getAllAsync: jest.fn().mockResolvedValue([]),
  runAsync: jest.fn().mockResolvedValue({ changes: 1, lastInsertRowId: 0 }),
};

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve(mockDb)),
}));

test('initializes the schema then renders the home screen', async () => {
  const { getByText } = render(<App />);

  await waitFor(() => expect(mockDb.execAsync).toHaveBeenCalled());
  await waitFor(() => expect(getByText('Your Topics')).toBeTruthy());
});
