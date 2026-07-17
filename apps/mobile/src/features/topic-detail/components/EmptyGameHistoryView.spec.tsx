import { render, screen } from '@testing-library/react-native';
import { EmptyGameHistoryView } from './EmptyGameHistoryView';

test('shows a message when no Games have been played yet', () => {
  render(<EmptyGameHistoryView />);

  expect(screen.getByTestId('empty-game-history-view')).toBeTruthy();
  expect(screen.getByText('No games played yet')).toBeTruthy();
});
