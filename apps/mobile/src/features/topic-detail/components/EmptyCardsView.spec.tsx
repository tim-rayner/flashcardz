import { fireEvent, render, screen } from '@testing-library/react-native';
import { EmptyCardsView } from './EmptyCardsView';

test('calls onAddQuestions when the CTA is pressed', () => {
  const onAddQuestions = jest.fn();
  render(<EmptyCardsView onAddQuestions={onAddQuestions} />);

  fireEvent.press(screen.getByTestId('empty-cards-cta'));

  expect(onAddQuestions).toHaveBeenCalledTimes(1);
});
