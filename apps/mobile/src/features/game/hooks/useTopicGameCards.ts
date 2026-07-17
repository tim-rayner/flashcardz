import { useEffect, useState } from 'react';
import { Card, OnboardStore } from '../../../utils/storage/onboard-store';
import {
  CardStatusFilter,
  getLatestCardStatuses,
} from '../../topic-detail/utils/cardStatus';

export interface UseTopicGameCardsResult {
  cards: Card[];
  isLoading: boolean;
}

export function useTopicGameCards(
  topicId: string,
  filter: CardStatusFilter,
): UseTopicGameCardsResult {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    Promise.all([
      OnboardStore.list('cards', { where: { topic_id: topicId } }),
      OnboardStore.list('card_results'),
    ]).then(([topicCards, allResults]) => {
      if (cancelled) return;
      const statuses = getLatestCardStatuses(allResults);
      const filtered =
        filter === 'all'
          ? topicCards
          : topicCards.filter((card) => (statuses.get(card.id) ?? 'never') === filter);
      setCards(filtered);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [topicId, filter]);

  return { cards, isLoading };
}
