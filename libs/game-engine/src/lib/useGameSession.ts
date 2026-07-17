import { useEffect, useState } from 'react';
import { createId } from './createId.js';
import { shuffleCards } from './shuffleCards.js';
import { GameCard, GameRepository, Result } from './types.js';

export interface UseGameSessionParams {
  topicId: string;
  cards: GameCard[];
  repository: GameRepository;
  random?: () => number;
  /**
   * Continues an existing (abandoned) session instead of starting a new one:
   * skips `createSession` and appends further results to this id.
   */
  resumeSessionId?: string;
}

export interface UseGameSessionResult {
  sessionId: string;
  cards: GameCard[];
  currentIndex: number;
  currentCard: GameCard | null;
  isRevealed: boolean;
  isComplete: boolean;
  reveal: () => void;
  grade: (result: Result) => Promise<void>;
}

export function useGameSession({
  topicId,
  cards,
  repository,
  random,
  resumeSessionId,
}: UseGameSessionParams): UseGameSessionResult {
  const [sessionId] = useState(() => resumeSessionId ?? createId());
  const [shuffledCards] = useState(() => shuffleCards(cards, random));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (resumeSessionId) return;
    repository.createSession({
      id: sessionId,
      topicId,
      startedAt: Date.now(),
      completedAt: null,
    });
    // Started once per session; sessionId/topicId/repository/resumeSessionId
    // never change for the lifetime of a single game.
  }, []);

  const reveal = () => setIsRevealed(true);

  const grade = async (result: Result) => {
    const currentCard = shuffledCards[currentIndex];
    await repository.recordResult({
      sessionId,
      cardId: currentCard.id,
      result,
      answeredAt: Date.now(),
    });

    if (currentIndex === shuffledCards.length - 1) {
      await repository.completeSession(sessionId, Date.now());
      setIsComplete(true);
      return;
    }

    setCurrentIndex((index) => index + 1);
    setIsRevealed(false);
  };

  return {
    sessionId,
    cards: shuffledCards,
    currentIndex,
    currentCard: isComplete ? null : shuffledCards[currentIndex],
    isRevealed,
    isComplete,
    reveal,
    grade,
  };
}
