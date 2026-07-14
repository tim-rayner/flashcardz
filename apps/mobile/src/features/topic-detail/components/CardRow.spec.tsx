import { fireEvent, render, screen } from '@testing-library/react-native';
import { CardRow } from './CardRow';

const card = {
  id: 'card-1',
  topicId: 'topic-1',
  question: 'What is SRP?',
  answer: 'Single Responsibility Principle',
  notes: null,
  createdAt: 1000,
  status: 'correct' as const,
};

test('renders the question and status badge', () => {
  render(<CardRow card={card} onPress={jest.fn()} />);

  expect(screen.getByText('What is SRP?')).toBeTruthy();
  expect(screen.getByTestId('card-status-badge-correct')).toBeTruthy();
});

test('calls onPress with the card when tapped', () => {
  const onPress = jest.fn();
  render(<CardRow card={card} onPress={onPress} />);

  fireEvent.press(screen.getByTestId('card-row-card-1'));

  expect(onPress).toHaveBeenCalledWith(card);
});
