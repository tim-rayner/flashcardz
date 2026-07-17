import { render, screen } from '@testing-library/react-native';
import { GameHistoryRow } from './GameHistoryRow';

const completedEntry = {
  session: { id: 's1', topicId: 't1', startedAt: Date.UTC(2026, 6, 16, 15, 40), completedAt: Date.UTC(2026, 6, 16, 15, 45) },
  score: { correct: 8, almost: 1, incorrect: 1, ratio: 0.8 },
};

const abandonedEntry = {
  session: { id: 's2', topicId: 't1', startedAt: Date.UTC(2026, 6, 14, 9, 2), completedAt: null },
  score: { correct: 4, almost: 0, incorrect: 2, ratio: 4 / 6 },
};

test('shows the Score, Answer Ratio, and formatted date for a Completed Game', () => {
  render(<GameHistoryRow entry={completedEntry} />);

  expect(screen.getByTestId('game-history-row-s1')).toBeTruthy();
  expect(screen.getByText('Jul 16, 2026, 3:40 PM')).toBeTruthy();
  expect(screen.getByText('80%')).toBeTruthy();
  expect(screen.getByText('8 correct, 1 almost, 1 incorrect')).toBeTruthy();
  expect(screen.queryByTestId('game-history-row-abandoned-badge')).toBeNull();
});

test('shows an Abandoned badge for an Abandoned Game', () => {
  render(<GameHistoryRow entry={abandonedEntry} />);

  expect(screen.getByTestId('game-history-row-abandoned-badge')).toBeTruthy();
});
