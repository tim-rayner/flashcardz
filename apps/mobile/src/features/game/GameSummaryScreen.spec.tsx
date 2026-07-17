import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { gameRepository } from './data/gameRepository';
import { GameSummaryScreen } from './GameSummaryScreen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  Stack: Object.assign(() => null, { Screen: () => null }),
}));

jest.mock('./data/gameRepository', () => ({
  gameRepository: {
    createSession: jest.fn(),
    recordResult: jest.fn(),
    completeSession: jest.fn(),
    listResultsForSession: jest.fn(),
  },
}));

const mockListResultsForSession = gameRepository.listResultsForSession as jest.Mock;

beforeEach(() => {
  mockListResultsForSession.mockReset();
  (router.replace as jest.Mock).mockReset();
  (router.back as jest.Mock).mockReset();
});

test('shows the score and answer ratio once results load', async () => {
  mockListResultsForSession.mockResolvedValue([
    { sessionId: 's1', cardId: 'card-1', result: 'correct', answeredAt: 1 },
    { sessionId: 's1', cardId: 'card-2', result: 'almost', answeredAt: 2 },
  ]);

  render(<GameSummaryScreen topicId="topic-1" sessionId="s1" filter="all" />);

  await waitFor(() => expect(screen.getByTestId('summary-ratio')).toHaveTextContent('50%'));
  expect(screen.getByTestId('summary-correct')).toHaveTextContent('Correct: 1');
  expect(screen.getByTestId('summary-almost')).toHaveTextContent('Almost: 1');
  expect(screen.getByTestId('summary-incorrect')).toHaveTextContent('Incorrect: 0');
});

test('Play Again navigates back to a fresh game with the same filter', async () => {
  mockListResultsForSession.mockResolvedValue([]);
  render(<GameSummaryScreen topicId="topic-1" sessionId="s1" filter="incorrect" />);
  await waitFor(() => expect(screen.getByTestId('summary-play-again')).toBeTruthy());

  fireEvent.press(screen.getByTestId('summary-play-again'));

  expect(router.replace).toHaveBeenCalledWith('/topics/topic-1/game?filter=incorrect');
});

test('Done pops back to the existing topic detail screen instead of replacing it', async () => {
  mockListResultsForSession.mockResolvedValue([]);
  render(<GameSummaryScreen topicId="topic-1" sessionId="s1" filter="all" />);
  await waitFor(() => expect(screen.getByTestId('summary-done')).toBeTruthy());

  fireEvent.press(screen.getByTestId('summary-done'));

  expect(router.back).toHaveBeenCalledTimes(1);
  expect(router.replace).not.toHaveBeenCalled();
});
