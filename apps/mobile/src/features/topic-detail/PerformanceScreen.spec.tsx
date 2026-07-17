import { render, screen } from '@testing-library/react-native';
import { useTopicGameHistory } from './hooks/useTopicGameHistory';
import { PerformanceScreen } from './PerformanceScreen';

jest.mock('./hooks/useTopicGameHistory', () => ({ useTopicGameHistory: jest.fn() }));

const mockUseTopicGameHistory = useTopicGameHistory as jest.Mock;

function mockHistory(overrides: Partial<ReturnType<typeof useTopicGameHistory>> = {}) {
  mockUseTopicGameHistory.mockReturnValue({
    summary: { entries: [], gamesPlayed: 0, averageRatio: 0 },
    isLoading: false,
    isRefreshing: false,
    refresh: jest.fn(),
    ...overrides,
  });
}

test('shows a loading indicator while the history is loading', () => {
  mockHistory({ isLoading: true });

  render(<PerformanceScreen topicId="topic-1" />);

  expect(screen.getByTestId('performance-loading')).toBeTruthy();
});

test('shows the empty state when no Games have been played', () => {
  mockHistory();

  render(<PerformanceScreen topicId="topic-1" />);

  expect(screen.getByTestId('empty-game-history-view')).toBeTruthy();
});

test('shows the summary header and a row per Game once history exists', () => {
  mockHistory({
    summary: {
      gamesPlayed: 2,
      averageRatio: 0.75,
      entries: [
        {
          session: { id: 's1', topicId: 'topic-1', startedAt: 1000, completedAt: 2000 },
          score: { correct: 3, almost: 0, incorrect: 1, ratio: 0.75 },
        },
        {
          session: { id: 's2', topicId: 'topic-1', startedAt: 500, completedAt: 1500 },
          score: { correct: 3, almost: 0, incorrect: 1, ratio: 0.75 },
        },
      ],
    },
  });

  render(<PerformanceScreen topicId="topic-1" />);

  expect(screen.getByText('Games played: 2')).toBeTruthy();
  expect(screen.getByText('Avg ratio: 75%')).toBeTruthy();
  expect(screen.getByTestId('game-history-row-s1')).toBeTruthy();
  expect(screen.getByTestId('game-history-row-s2')).toBeTruthy();
  expect(screen.queryByTestId('empty-game-history-view')).toBeNull();
});
