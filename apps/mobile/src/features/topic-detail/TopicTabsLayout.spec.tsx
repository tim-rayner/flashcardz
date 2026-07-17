import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Text } from 'react-native';
import { useTopicCardsContext } from './context/TopicCardsContext';
import { useAbandonedSession } from './hooks/useAbandonedSession';
import { useTopic } from './hooks/useTopic';
import { useTopicCards } from './hooks/useTopicCards';
import { TopicTabsLayout } from './TopicTabsLayout';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  Stack: Object.assign(() => null, { Screen: () => null }),
}));
jest.mock('./hooks/useTopic', () => ({ useTopic: jest.fn() }));
jest.mock('./hooks/useTopicCards', () => ({ useTopicCards: jest.fn() }));
jest.mock('./hooks/useAbandonedSession', () => ({ useAbandonedSession: jest.fn() }));

const mockUseTopic = useTopic as jest.Mock;
const mockUseTopicCards = useTopicCards as jest.Mock;
const mockUseAbandonedSession = useAbandonedSession as jest.Mock;

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

function ContextProbe() {
  const context = useTopicCardsContext();
  return (
    <>
      <Text testID="context-filter">{context.filter}</Text>
      <Text testID="context-topic-id">{context.topicId}</Text>
    </>
  );
}

beforeEach(() => {
  mockUseTopic.mockReturnValue({ topic: { id: 'topic-1', name: 'SOLID', createdAt: 1 }, isLoading: false });
  mockUseAbandonedSession.mockReturnValue({ abandonedSessionId: null, refresh: jest.fn() });
});

test('renders its children inside the shared header', () => {
  mockTopicCards();

  render(
    <TopicTabsLayout topicId="topic-1">
      <Text testID="tab-content">content</Text>
    </TopicTabsLayout>,
  );

  expect(screen.getByTestId('tab-content')).toBeTruthy();
  expect(screen.getByTestId('start-game-button')).toBeTruthy();
});

test('exposes the current cards/filter state to children via context', () => {
  mockTopicCards({ filter: 'never' });

  render(
    <TopicTabsLayout topicId="topic-1">
      <ContextProbe />
    </TopicTabsLayout>,
  );

  expect(screen.getByTestId('context-filter').props.children).toBe('never');
  expect(screen.getByTestId('context-topic-id').props.children).toBe('topic-1');
});

test('the Start game button is disabled when the current filter matches no cards', () => {
  mockTopicCards();

  render(
    <TopicTabsLayout topicId="topic-1">
      <Text />
    </TopicTabsLayout>,
  );

  expect(screen.getByTestId('start-game-button').props.accessibilityState).toEqual({
    disabled: true,
  });
});

test('the Start game button is enabled and navigates with the current filter when pressed', () => {
  mockTopicCards({
    cardsWithStatus: [cardNeverAnswered],
    filteredCards: [cardNeverAnswered],
    filter: 'never',
  });

  render(
    <TopicTabsLayout topicId="topic-1">
      <Text />
    </TopicTabsLayout>,
  );

  fireEvent.press(screen.getByTestId('start-game-button'));

  expect(router.push).toHaveBeenCalledWith('/topics/topic-1/game?filter=never');
});

test('the manage-cards button opens the manage-cards modal, and saving calls saveCardChanges', () => {
  const saveCardChanges = jest.fn().mockResolvedValue(undefined);
  mockTopicCards({
    cardsWithStatus: [cardNeverAnswered],
    filteredCards: [cardNeverAnswered],
    saveCardChanges,
  });

  render(
    <TopicTabsLayout topicId="topic-1">
      <Text />
    </TopicTabsLayout>,
  );

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

test('context.openManageModal opens the manage-cards modal pre-populated with that card', () => {
  mockTopicCards({
    cardsWithStatus: [cardNeverAnswered],
    filteredCards: [cardNeverAnswered],
  });

  function OpenFromChild() {
    const context = useTopicCardsContext();
    return <Text testID="open-card" onPress={() => context.openManageModal('card-1')} />;
  }

  render(
    <TopicTabsLayout topicId="topic-1">
      <OpenFromChild />
    </TopicTabsLayout>,
  );

  fireEvent.press(screen.getByTestId('open-card'));

  expect(screen.getByTestId('manage-cards-question-input').props.value).toBe('What is SRP?');
});
