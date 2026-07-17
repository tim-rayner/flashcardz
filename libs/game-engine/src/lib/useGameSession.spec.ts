import { act } from 'react-test-renderer';
import { renderHook } from '../test-utils/renderHook.js';
import { useGameSession } from './useGameSession.js';
import { GameCard, GameRepository } from './types.js';

function createMockRepository(): jest.Mocked<GameRepository> {
  return {
    createSession: jest.fn().mockResolvedValue(undefined),
    recordResult: jest.fn().mockResolvedValue(undefined),
    completeSession: jest.fn().mockResolvedValue(undefined),
    listResultsForSession: jest.fn().mockResolvedValue([]),
  };
}

const cards: GameCard[] = [
  { id: 'card-1', question: 'Q1', answer: 'A1' },
  { id: 'card-2', question: 'Q2', answer: 'A2' },
  { id: 'card-3', question: 'Q3', answer: 'A3' },
];

afterEach(() => {
  jest.restoreAllMocks();
});

test('shuffles the given cards and starts a session on mount', () => {
  const repository = createMockRepository();
  jest.spyOn(Date, 'now').mockReturnValue(1000);
  const random = () => 0;

  const { result } = renderHook(() =>
    useGameSession({ topicId: 'topic-1', cards, repository, random }),
  );

  expect(result.current.currentIndex).toBe(0);
  expect(result.current.isRevealed).toBe(false);
  expect(result.current.isComplete).toBe(false);
  expect(result.current.cards).toEqual([cards[1], cards[2], cards[0]]);
  expect(result.current.currentCard).toEqual(cards[1]);
  expect(repository.createSession).toHaveBeenCalledWith({
    id: result.current.sessionId,
    topicId: 'topic-1',
    startedAt: 1000,
    completedAt: null,
  });
});

test('reveal shows the answer without advancing the card', () => {
  const repository = createMockRepository();
  const { result } = renderHook(() =>
    useGameSession({ topicId: 'topic-1', cards, repository, random: () => 0 }),
  );

  act(() => result.current.reveal());

  expect(result.current.isRevealed).toBe(true);
  expect(result.current.currentIndex).toBe(0);
});

test('grading a non-final card records the result and advances to the next card', async () => {
  const repository = createMockRepository();
  jest.spyOn(Date, 'now').mockReturnValue(2000);
  const { result } = renderHook(() =>
    useGameSession({ topicId: 'topic-1', cards, repository, random: () => 0 }),
  );
  act(() => result.current.reveal());

  await act(async () => {
    await result.current.grade('correct');
  });

  expect(repository.recordResult).toHaveBeenCalledWith({
    sessionId: result.current.sessionId,
    cardId: 'card-2',
    result: 'correct',
    answeredAt: 2000,
  });
  expect(repository.completeSession).not.toHaveBeenCalled();
  expect(result.current.currentIndex).toBe(1);
  expect(result.current.currentCard).toEqual(cards[2]);
  expect(result.current.isRevealed).toBe(false);
  expect(result.current.isComplete).toBe(false);
});

test('grading the final card records the result and completes the session', async () => {
  const repository = createMockRepository();
  jest.spyOn(Date, 'now').mockReturnValue(3000);
  const { result } = renderHook(() =>
    useGameSession({ topicId: 'topic-1', cards, repository, random: () => 0 }),
  );

  await act(async () => {
    await result.current.grade('correct');
  });
  await act(async () => {
    await result.current.grade('almost');
  });
  await act(async () => {
    await result.current.grade('incorrect');
  });

  expect(repository.completeSession).toHaveBeenCalledWith(
    result.current.sessionId,
    3000,
  );
  expect(result.current.isComplete).toBe(true);
  expect(result.current.currentCard).toBeNull();
});
