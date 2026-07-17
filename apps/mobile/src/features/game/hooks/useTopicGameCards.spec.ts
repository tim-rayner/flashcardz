import { renderHook, waitFor } from '@testing-library/react-native';
import { OnboardStore } from '../../../utils/storage/onboard-store';
import { useTopicGameCards } from './useTopicGameCards';

jest.mock('../../../utils/storage/onboard-store', () => ({
  OnboardStore: {
    list: jest.fn(),
  },
}));

const mockList = OnboardStore.list as jest.Mock;

const cardNeverAnswered = {
  id: 'card-1',
  topicId: 'topic-1',
  question: 'What is SRP?',
  answer: 'Single Responsibility Principle',
  notes: null,
  createdAt: 2000,
};

const cardAnsweredCorrect = {
  id: 'card-2',
  topicId: 'topic-1',
  question: 'What is OCP?',
  answer: 'Open/Closed Principle',
  notes: null,
  createdAt: 1000,
};

const cardResults = [
  { sessionId: 's1', cardId: 'card-2', result: 'correct', answeredAt: 500 },
];

function mockLoad(cards: unknown[], results: unknown[] = cardResults) {
  mockList.mockImplementation((table: string) =>
    Promise.resolve(table === 'cards' ? cards : results),
  );
}

beforeEach(() => {
  mockList.mockReset();
});

test('loads a topic\'s cards narrowed to the given status filter', async () => {
  mockLoad([cardNeverAnswered, cardAnsweredCorrect]);

  const { result } = renderHook(() => useTopicGameCards('topic-1', 'correct'));
  expect(result.current.isLoading).toBe(true);

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  expect(mockList).toHaveBeenCalledWith('cards', { where: { topic_id: 'topic-1' } });
  expect(mockList).toHaveBeenCalledWith('card_results');
  expect(result.current.cards).toEqual([cardAnsweredCorrect]);
});

test('the "all" filter returns every card regardless of status', async () => {
  mockLoad([cardNeverAnswered, cardAnsweredCorrect]);

  const { result } = renderHook(() => useTopicGameCards('topic-1', 'all'));
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  expect(result.current.cards).toEqual([cardNeverAnswered, cardAnsweredCorrect]);
});
