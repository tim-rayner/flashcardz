import { act, renderHook, waitFor } from '@testing-library/react-native';
import { OnboardStore } from '../../../utils/storage/onboard-store';
import { useTopicCards } from './useTopicCards';

jest.mock('../../../utils/storage/onboard-store', () => ({
  OnboardStore: {
    list: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

const mockList = OnboardStore.list as jest.Mock;
const mockSet = OnboardStore.set as jest.Mock;
const mockRemove = OnboardStore.remove as jest.Mock;

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

function mockLoadOnce(cards: unknown[], results: unknown[] = cardResults) {
  mockList.mockImplementationOnce((table: string) =>
    Promise.resolve(table === 'cards' ? cards : results),
  );
  mockList.mockImplementationOnce((table: string) =>
    Promise.resolve(table === 'cards' ? cards : results),
  );
}

beforeEach(() => {
  mockList.mockReset();
  mockSet.mockReset().mockResolvedValue(undefined);
  mockRemove.mockReset().mockResolvedValue(undefined);
});

test('loads a topic\'s cards filtered by topic id, newest first, with derived status', async () => {
  mockLoadOnce([cardNeverAnswered, cardAnsweredCorrect]);

  const { result } = renderHook(() => useTopicCards('topic-1'));
  expect(result.current.isLoading).toBe(true);

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  expect(mockList).toHaveBeenCalledWith('cards', {
    where: { topic_id: 'topic-1' },
    orderBy: 'created_at',
    direction: 'DESC',
  });
  expect(mockList).toHaveBeenCalledWith('card_results');
  expect(result.current.cardsWithStatus).toEqual([
    { ...cardNeverAnswered, status: 'never' },
    { ...cardAnsweredCorrect, status: 'correct' },
  ]);
});

test('filteredCards narrows to the active status filter', async () => {
  mockLoadOnce([cardNeverAnswered, cardAnsweredCorrect]);

  const { result } = renderHook(() => useTopicCards('topic-1'));
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  act(() => result.current.setFilter('correct'));

  expect(result.current.filteredCards).toEqual([
    { ...cardAnsweredCorrect, status: 'correct' },
  ]);
});

test('saveCardChanges upserts new/edited drafts, deletes removed cards, and reloads', async () => {
  mockLoadOnce([cardNeverAnswered, cardAnsweredCorrect]);

  const { result } = renderHook(() => useTopicCards('topic-1'));
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  mockLoadOnce([cardAnsweredCorrect], []);
  jest.spyOn(Date, 'now').mockReturnValue(9000);

  await act(async () => {
    await result.current.saveCardChanges([
      {
        id: 'card-2',
        question: 'What is OCP?  ',
        answer: '  Open/Closed Principle',
        notes: null,
      },
      {
        id: 'new-card',
        question: 'What is LSP?',
        answer: 'Liskov Substitution Principle',
        notes: '  ',
      },
    ]);
  });

  expect(mockRemove).toHaveBeenCalledWith('cards', { id: 'card-1' });
  expect(mockSet).toHaveBeenCalledWith('cards', {
    id: 'card-2',
    topicId: 'topic-1',
    question: 'What is OCP?',
    answer: 'Open/Closed Principle',
    notes: null,
    createdAt: 1000,
  });
  expect(mockSet).toHaveBeenCalledWith('cards', {
    id: 'new-card',
    topicId: 'topic-1',
    question: 'What is LSP?',
    answer: 'Liskov Substitution Principle',
    notes: null,
    createdAt: 9000,
  });
});
