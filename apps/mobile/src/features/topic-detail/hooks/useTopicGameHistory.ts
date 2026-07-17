import { GameHistorySummary, summarizeGameHistory } from '@org/game-engine';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { OnboardStore } from '../../../utils/storage/onboard-store';

export interface UseTopicGameHistoryResult {
  summary: GameHistorySummary;
  isLoading: boolean;
  isRefreshing: boolean;
  refresh: () => Promise<void>;
}

export function useTopicGameHistory(topicId: string): UseTopicGameHistoryResult {
  const [summary, setSummary] = useState<GameHistorySummary>(() => summarizeGameHistory([]));
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    const sessions = await OnboardStore.list('sessions', { where: { topic_id: topicId } });
    const games = await Promise.all(
      sessions.map(async (session) => {
        const results = await OnboardStore.list('card_results', {
          where: { session_id: session.id },
        });
        return { session, results: results.map((cardResult) => cardResult.result) };
      }),
    );
    setSummary(summarizeGameHistory(games));
  }, [topicId]);

  useFocusEffect(
    useCallback(() => {
      load().finally(() => setIsLoading(false));
    }, [load]),
  );

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await load();
    } finally {
      setIsRefreshing(false);
    }
  }, [load]);

  return { summary, isLoading, isRefreshing, refresh };
}
