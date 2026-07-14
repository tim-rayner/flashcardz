import { useEffect, useState } from 'react';
import { OnboardStore, Topic } from '../../../utils/storage/onboard-store';

export interface UseTopicResult {
  topic: Topic | null;
  isLoading: boolean;
}

export function useTopic(topicId: string): UseTopicResult {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    OnboardStore.get('topics', { id: topicId }).then((result) => {
      if (!cancelled) {
        setTopic(result);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [topicId]);

  return { topic, isLoading };
}
