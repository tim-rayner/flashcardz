import { fireEvent, render, screen } from '@testing-library/react-native';
import { CardsTabScreen } from './CardsTabScreen';
import { TopicCardsContext, TopicCardsContextValue } from './context/TopicCardsContext';

const cardNeverAnswered = {
  id: 'card-1',
  topicId: 'topic-1',
  question: 'What is SRP?',
  answer: 'Single Responsibility Principle',
  notes: null,
  createdAt: 1000,
  status: 'never' as const,
};

function renderWithContext(overrides: Partial<TopicCardsContextValue> = {}) {
  const value: TopicCardsContextValue = {
    topicId: 'topic-1',
    cardsWithStatus: [],
    filteredCards: [],
    filter: 'all',
    setFilter: jest.fn(),
    isLoading: false,
    isRefreshing: false,
    refresh: jest.fn(),
    saveCardChanges: jest.fn(),
    openManageModal: jest.fn(),
    ...overrides,
  };
  render(
    <TopicCardsContext.Provider value={value}>
      <CardsTabScreen />
    </TopicCardsContext.Provider>,
  );
  return value;
}

test('shows the empty-cards CTA when the topic has no cards, and it opens the manage-cards modal', () => {
  const value = renderWithContext();

  expect(screen.getByTestId('empty-cards-view')).toBeTruthy();
  expect(screen.queryByTestId('card-status-filter')).toBeNull();

  fireEvent.press(screen.getByTestId('empty-cards-cta'));
  expect(value.openManageModal).toHaveBeenCalledWith();
});

test('shows the filter and card list once cards exist, and tapping a row opens that card', () => {
  const value = renderWithContext({
    cardsWithStatus: [cardNeverAnswered],
    filteredCards: [cardNeverAnswered],
  });

  expect(screen.getByTestId('card-status-filter')).toBeTruthy();
  expect(screen.getByTestId('card-row-card-1')).toBeTruthy();

  fireEvent.press(screen.getByTestId('card-row-card-1'));
  expect(value.openManageModal).toHaveBeenCalledWith('card-1');
});
