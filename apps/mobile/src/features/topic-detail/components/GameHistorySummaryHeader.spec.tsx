import { render, screen } from '@testing-library/react-native';
import { GameHistorySummaryHeader } from './GameHistorySummaryHeader';

test('shows Games played and Avg ratio computed over Completed Games', () => {
  render(<GameHistorySummaryHeader gamesPlayed={12} averageRatio={0.74} />);

  expect(screen.getByText('Games played: 12')).toBeTruthy();
  expect(screen.getByText('Avg ratio: 74%')).toBeTruthy();
});
