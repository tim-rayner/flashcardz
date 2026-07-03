import { useCallback, useEffect, useState } from 'react';
import { createId } from '../../../utils/id';
import { OnboardStore, Topic } from '../../../utils/storage/onboard-store';

export interface UseTopicsResult {
  topics: Topic[];
  isLoading: boolean;
  isRefreshing: boolean;
  createTopic: (name: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useTopics(): UseTopicsResult {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadTopics = useCallback(async () => {
    const rows = await OnboardStore.list('topics', {
      orderBy: 'created_at',
      direction: 'DESC',
    });
    setTopics(rows);
  }, []);

  useEffect(() => {
    loadTopics().finally(() => setIsLoading(false));
  }, [loadTopics]);

  const createTopic = useCallback(
    async (name: string) => {
      const trimmedName = name.trim();
      if (!trimmedName) return;
      await OnboardStore.set('topics', {
        id: createId(),
        name: trimmedName,
        createdAt: Date.now(),
      });
      await loadTopics();
    },
    [loadTopics],
  );

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadTopics();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadTopics]);

  return { topics, isLoading, isRefreshing, createTopic, refresh };
}
