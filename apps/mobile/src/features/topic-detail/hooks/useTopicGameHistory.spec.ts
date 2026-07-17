import { act, renderHook, waitFor } from '@testing-library/react-native';
import { OnboardStore } from '../../../utils/storage/onboard-store';
import { useTopicGameHistory } from './useTopicGameHistory';

jest.mock('../../../utils/storage/onboard-store', () => ({
  OnboardStore: {
    list: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  useFocusEffect: (callback: () => void) => {
    const { useEffect } = require('react');
    useEffect(callback, [callback]);
  },
}));

const mockList = OnboardStore.list as jest.Mock;

const completedSession = { id: 's1', topicId: 'topic-1', startedAt: 100, completedAt: 200 };

beforeEach(() => {
  mockList.mockReset();
});

test('loads a topic Game history and summarizes it', async () => {
  mockList.mockImplementation((table: string) => {
    if (table === 'sessions') return Promise.resolve([completedSession]);
    if (table === 'card_results') {
      return Promise.resolve([
        { sessionId: 's1', cardId: 'c1', result: 'correct', answeredAt: 150 },
        { sessionId: 's1', cardId: 'c2', result: 'incorrect', answeredAt: 160 },
      ]);
    }
    return Promise.resolve([]);
  });

  const { result } = renderHook(() => useTopicGameHistory('topic-1'));

  expect(result.current.isLoading).toBe(true);

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  expect(mockList).toHaveBeenCalledWith('sessions', { where: { topic_id: 'topic-1' } });
  expect(mockList).toHaveBeenCalledWith('card_results', { where: { session_id: 's1' } });
  expect(result.current.summary).toEqual({
    entries: [{ session: completedSession, score: { correct: 1, almost: 0, incorrect: 1, ratio: 0.5 } }],
    gamesPlayed: 1,
    averageRatio: 0.5,
  });
});

test('refresh reloads history and toggles isRefreshing', async () => {
  mockList.mockResolvedValue([]);
  const { result } = renderHook(() => useTopicGameHistory('topic-1'));
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  mockList.mockImplementation((table: string) =>
    Promise.resolve(table === 'sessions' ? [completedSession] : []),
  );

  await act(async () => {
    await result.current.refresh();
  });

  expect(result.current.isRefreshing).toBe(false);
  expect(result.current.summary.entries.map((entry) => entry.session.id)).toEqual(['s1']);
});
