import { fireEvent, render, screen } from '@testing-library/react-native';
import { useTopic } from './hooks/useTopic';
import { useTopicCards } from './hooks/useTopicCards';
import { TopicDetailScreen } from './TopicDetailScreen';

jest.mock('expo-router', () => ({
  Stack: Object.assign(() => null, { Screen: () => null }),
}));
jest.mock('./hooks/useTopic', () => ({ useTopic: jest.fn() }));
jest.mock('./hooks/useTopicCards', () => ({ useTopicCards: jest.fn() }));

const mockUseTopic = useTopic as jest.Mock;
const mockUseTopicCards = useTopicCards as jest.Mock;

const cardNeverAnswered = {
  id: 'card-1',
  topicId: 'topic-1',
  question: 'What is SRP?',
  answer: 'Single Responsibility Principle',
  notes: null,
  createdAt: 1000,
  status: 'never' as const,
};

function mockTopicCards(overrides: Partial<ReturnType<typeof useTopicCards>> = {}) {
  mockUseTopicCards.mockReturnValue({
    cardsWithStatus: [],
    filteredCards: [],
    filter: 'all',
    setFilter: jest.fn(),
    isLoading: false,
    isRefreshing: false,
    refresh: jest.fn(),
    saveCardChanges: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  });
}

beforeEach(() => {
  mockUseTopic.mockReturnValue({ topic: { id: 'topic-1', name: 'SOLID', createdAt: 1 }, isLoading: false });
});

test('shows the empty-cards CTA when the topic has no cards', () => {
  mockTopicCards();

  render(<TopicDetailScreen topicId="topic-1" />);

  expect(screen.getByTestId('empty-cards-view')).toBeTruthy();
  expect(screen.queryByTestId('card-status-filter')).toBeNull();
});

test('shows the filter and card list once cards exist', () => {
  mockTopicCards({
    cardsWithStatus: [cardNeverAnswered],
    filteredCards: [cardNeverAnswered],
  });

  render(<TopicDetailScreen topicId="topic-1" />);

  expect(screen.getByTestId('card-status-filter')).toBeTruthy();
  expect(screen.getByTestId('card-row-card-1')).toBeTruthy();
  expect(screen.queryByTestId('empty-cards-view')).toBeNull();
});

test('the Start game button is disabled', () => {
  mockTopicCards();

  render(<TopicDetailScreen topicId="topic-1" />);

  expect(screen.getByTestId('start-game-button').props.accessibilityState).toEqual({
    disabled: true,
  });
});

test('the empty-cards CTA, the manage-cards button, and tapping a card row all open the manage-cards modal and save through saveCardChanges', () => {
  const saveCardChanges = jest.fn().mockResolvedValue(undefined);
  mockTopicCards({
    cardsWithStatus: [cardNeverAnswered],
    filteredCards: [cardNeverAnswered],
    saveCardChanges,
  });

  render(<TopicDetailScreen topicId="topic-1" />);

  fireEvent.press(screen.getByTestId('manage-cards-button'));
  fireEvent.press(screen.getByTestId('manage-cards-save'));

  expect(saveCardChanges).toHaveBeenCalledWith([
    {
      id: 'card-1',
      question: 'What is SRP?',
      answer: 'Single Responsibility Principle',
      notes: null,
    },
  ]);
});

test('tapping a card row opens the manage-cards modal pre-populated with that card', () => {
  mockTopicCards({
    cardsWithStatus: [cardNeverAnswered],
    filteredCards: [cardNeverAnswered],
  });

  render(<TopicDetailScreen topicId="topic-1" />);

  fireEvent.press(screen.getByTestId('card-row-card-1'));

  expect(screen.getByTestId('manage-cards-question-input').props.value).toBe('What is SRP?');
  expect(screen.getByTestId('manage-cards-answer-input').props.value).toBe(
    'Single Responsibility Principle',
  );
});
