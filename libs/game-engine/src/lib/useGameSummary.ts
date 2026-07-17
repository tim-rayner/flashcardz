import { useEffect, useState } from 'react';
import { computeGameScore, GameScore } from './gameScore.js';
import { GameRepository } from './types.js';

export interface UseGameSummaryParams {
  sessionId: string;
  repository: Pick<GameRepository, 'listResultsForSession'>;
}

export interface UseGameSummaryResult {
  isLoading: boolean;
  score: GameScore;
}

export function useGameSummary({
  sessionId,
  repository,
}: UseGameSummaryParams): UseGameSummaryResult {
  const [isLoading, setIsLoading] = useState(true);
  const [score, setScore] = useState<GameScore>(() => computeGameScore([]));

  useEffect(() => {
    let cancelled = false;
    repository.listResultsForSession(sessionId).then((results) => {
      if (!cancelled) {
        setScore(computeGameScore(results.map((cardResult) => cardResult.result)));
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [sessionId, repository]);

  return { isLoading, score };
}
