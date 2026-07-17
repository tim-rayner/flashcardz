import { computeGameScore, GameScore } from './gameScore.js';
import { GameSession, Result } from './types.js';

export interface GameHistoryEntry {
  session: GameSession;
  score: GameScore;
}

export interface GameHistorySummary {
  entries: GameHistoryEntry[];
  gamesPlayed: number;
  averageRatio: number;
}

export interface GameHistoryInput {
  session: GameSession;
  results: Result[];
}

export function summarizeGameHistory(games: GameHistoryInput[]): GameHistorySummary {
  const entries = games
    .map(({ session, results }) => ({
      session,
      score: computeGameScore(results),
    }))
    .sort((a, b) => b.session.startedAt - a.session.startedAt);

  const completed = entries.filter((entry) => entry.session.completedAt !== null);

  return {
    entries,
    gamesPlayed: completed.length,
    averageRatio:
      completed.length === 0
        ? 0
        : completed.reduce((sum, entry) => sum + entry.score.ratio, 0) / completed.length,
  };
}
