import { CardResult } from '../../../utils/storage/onboard-store';

export type CardStatus = 'never' | 'correct' | 'incorrect' | 'almost';

export const CARD_STATUS_FILTERS = [
  'all',
  'never',
  'correct',
  'incorrect',
  'almost',
] as const;

export type CardStatusFilter = (typeof CARD_STATUS_FILTERS)[number];

export function isCardStatusFilter(value: unknown): value is CardStatusFilter {
  return (CARD_STATUS_FILTERS as readonly unknown[]).includes(value);
}

export const CARD_STATUS_LABELS: Record<CardStatusFilter, string> = {
  all: 'All',
  never: 'Never answered',
  correct: 'Correct',
  incorrect: 'Incorrect',
  almost: 'Almost',
};

/**
 * A card's status is whatever it scored on its most recent answer, so
 * earlier attempts in the results list are discarded once a later one is
 * found for the same card.
 */
export function getLatestCardStatuses(
  cardResults: CardResult[],
): Map<string, CardStatus> {
  const latestByCard = new Map<string, CardResult>();
  for (const result of cardResults) {
    const current = latestByCard.get(result.cardId);
    if (!current || result.answeredAt > current.answeredAt) {
      latestByCard.set(result.cardId, result);
    }
  }

  const statuses = new Map<string, CardStatus>();
  for (const [cardId, result] of latestByCard) {
    statuses.set(cardId, result.result);
  }
  return statuses;
}
