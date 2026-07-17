import { render, screen, waitFor } from '@testing-library/react-native';
import { OnboardStore } from '../../utils/storage/onboard-store';
import { GameScreen } from './GameScreen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  Stack: Object.assign(() => null, { Screen: () => null }),
}));

jest.mock('../../utils/storage/onboard-store', () => ({
  OnboardStore: {
    get: jest.fn(),
    set: jest.fn(),
    list: jest.fn(),
  },
}));

const mockSet = OnboardStore.set as jest.Mock;
const mockList = OnboardStore.list as jest.Mock;

beforeEach(() => {
  mockSet.mockReset().mockResolvedValue(undefined);
  mockList.mockReset();
});

test('shows a loading state while cards are loading', () => {
  mockList.mockReturnValue(new Promise(() => undefined));

  render(<GameScreen topicId="topic-1" filter="all" />);

  expect(screen.getByTestId('game-loading')).toBeTruthy();
});

test('shows an empty state when no cards match the filter', async () => {
  mockList.mockImplementation((table: string) =>
    Promise.resolve(table === 'cards' ? [] : []),
  );

  render(<GameScreen topicId="topic-1" filter="incorrect" />);

  await waitFor(() => expect(screen.getByTestId('game-empty')).toBeTruthy());
});

test('renders the first card once cards finish loading', async () => {
  const cardRow = {
    id: 'card-1',
    topicId: 'topic-1',
    question: 'What is SRP?',
    answer: 'Single Responsibility Principle',
    notes: null,
    createdAt: 1000,
  };
  mockList.mockImplementation((table: string) =>
    Promise.resolve(table === 'cards' ? [cardRow] : []),
  );

  render(<GameScreen topicId="topic-1" filter="all" />);

  await waitFor(() => expect(screen.getByText('What is SRP?')).toBeTruthy());
});
