import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, OnboardStore } from '../../../utils/storage/onboard-store';
import {
  CardStatus,
  CardStatusFilter,
  getLatestCardStatuses,
} from '../utils/cardStatus';

export interface CardWithStatus extends Card {
  status: CardStatus;
}

export interface CardDraft {
  id: string;
  question: string;
  answer: string;
  notes: string | null;
}

export interface UseTopicCardsResult {
  cardsWithStatus: CardWithStatus[];
  filteredCards: CardWithStatus[];
  filter: CardStatusFilter;
  setFilter: (filter: CardStatusFilter) => void;
  isLoading: boolean;
  isRefreshing: boolean;
  refresh: () => Promise<void>;
  saveCardChanges: (drafts: CardDraft[]) => Promise<void>;
}

export function useTopicCards(topicId: string): UseTopicCardsResult {
  const [cards, setCards] = useState<Card[]>([]);
  const [statuses, setStatuses] = useState<Map<string, CardStatus>>(new Map());
  const [filter, setFilter] = useState<CardStatusFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [topicCards, allResults] = await Promise.all([
      OnboardStore.list('cards', {
        where: { topic_id: topicId },
        orderBy: 'created_at',
        direction: 'DESC',
      }),
      OnboardStore.list('card_results'),
    ]);
    setCards(topicCards);
    setStatuses(getLatestCardStatuses(allResults));
  }, [topicId]);

  useEffect(() => {
    load().finally(() => setIsLoading(false));
  }, [load]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await load();
    } finally {
      setIsRefreshing(false);
    }
  }, [load]);

  const cardsWithStatus = useMemo<CardWithStatus[]>(
    () =>
      cards.map((card) => ({
        ...card,
        status: statuses.get(card.id) ?? 'never',
      })),
    [cards, statuses],
  );

  const filteredCards = useMemo(
    () =>
      filter === 'all'
        ? cardsWithStatus
        : cardsWithStatus.filter((card) => card.status === filter),
    [cardsWithStatus, filter],
  );

  const saveCardChanges = useCallback(
    async (drafts: CardDraft[]) => {
      const draftIds = new Set(drafts.map((draft) => draft.id));
      const removedCards = cards.filter((card) => !draftIds.has(card.id));
      const originalById = new Map(cards.map((card) => [card.id, card]));

      await Promise.all([
        ...removedCards.map((card) => OnboardStore.remove('cards', { id: card.id })),
        ...drafts.map((draft) => {
          const original = originalById.get(draft.id);
          return OnboardStore.set('cards', {
            id: draft.id,
            topicId,
            question: draft.question.trim(),
            answer: draft.answer.trim(),
            notes: draft.notes?.trim() || null,
            createdAt: original?.createdAt ?? Date.now(),
          });
        }),
      ]);

      await load();
    },
    [cards, topicId, load],
  );

  return {
    cardsWithStatus,
    filteredCards,
    filter,
    setFilter,
    isLoading,
    isRefreshing,
    refresh,
    saveCardChanges,
  };
}
