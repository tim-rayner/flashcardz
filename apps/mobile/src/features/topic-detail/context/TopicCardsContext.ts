import { createContext, useContext } from 'react';
import { UseTopicCardsResult } from '../hooks/useTopicCards';

export interface TopicCardsContextValue extends UseTopicCardsResult {
  topicId: string;
  openManageModal: (cardId?: string | null) => void;
}

export const TopicCardsContext = createContext<TopicCardsContextValue | null>(null);

export function useTopicCardsContext(): TopicCardsContextValue {
  const value = useContext(TopicCardsContext);
  if (!value) {
    throw new Error('useTopicCardsContext must be used within a TopicCardsContext.Provider');
  }
  return value;
}
