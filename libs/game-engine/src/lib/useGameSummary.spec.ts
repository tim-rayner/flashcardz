import { renderHook } from '../test-utils/renderHook.js';
import { act } from 'react-test-renderer';
import { useGameSummary } from './useGameSummary.js';
import { GameRepository } from './types.js';

test('loads the session results and computes the score', async () => {
  const listResultsForSession = jest.fn().mockResolvedValue([
    { sessionId: 's1', cardId: 'card-1', result: 'correct', answeredAt: 1 },
    { sessionId: 's1', cardId: 'card-2', result: 'almost', answeredAt: 2 },
  ]);
  const repository = { listResultsForSession } as unknown as GameRepository;

  const { result } = renderHook(() =>
    useGameSummary({ sessionId: 's1', repository }),
  );

  expect(result.current.isLoading).toBe(true);

  await act(async () => {
    await Promise.resolve();
  });

  expect(listResultsForSession).toHaveBeenCalledWith('s1');
  expect(result.current.isLoading).toBe(false);
  expect(result.current.score).toEqual({
    correct: 1,
    almost: 1,
    incorrect: 0,
    ratio: 0.5,
  });
});
