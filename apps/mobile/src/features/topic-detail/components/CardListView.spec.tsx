import { fireEvent, render, screen } from '@testing-library/react-native';
import { CardListView } from './CardListView';

const cards = [
  {
    id: 'card-1',
    topicId: 'topic-1',
    question: 'What is SRP?',
    answer: 'Single Responsibility Principle',
    notes: null,
    createdAt: 1000,
    status: 'never' as const,
  },
];

test('renders a row per card', () => {
  render(<CardListView cards={cards} onSelectCard={jest.fn()} />);

  expect(screen.getByTestId('card-row-card-1')).toBeTruthy();
});

test('shows an empty-filter message instead of a list when there are no cards to show', () => {
  render(<CardListView cards={[]} onSelectCard={jest.fn()} />);

  expect(screen.getByTestId('card-list-empty-filter')).toBeTruthy();
  expect(screen.getByText('No cards match this filter')).toBeTruthy();
});

test('calls onSelectCard with the tapped card', () => {
  const onSelectCard = jest.fn();
  render(<CardListView cards={cards} onSelectCard={onSelectCard} />);

  fireEvent.press(screen.getByTestId('card-row-card-1'));

  expect(onSelectCard).toHaveBeenCalledWith(cards[0]);
});
