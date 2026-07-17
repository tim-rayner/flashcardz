export type Result = 'correct' | 'incorrect' | 'almost';

export interface GameCard {
  id: string;
  question: string;
  answer: string;
  notes?: string | null;
}

export interface GameSession {
  id: string;
  topicId: string;
  startedAt: number;
  completedAt: number | null;
}

export interface GameCardResult {
  sessionId: string;
  cardId: string;
  result: Result;
  answeredAt: number;
}

/**
 * Persistence contract the engine depends on rather than a concrete store,
 * so the engine itself stays free of any storage/platform dependency - see
 * CONTEXT.md and the apps/mobile OnboardStore-backed implementation.
 */
export interface GameRepository {
  createSession(session: GameSession): Promise<void>;
  recordResult(result: GameCardResult): Promise<void>;
  completeSession(sessionId: string, completedAt: number): Promise<void>;
  listResultsForSession(sessionId: string): Promise<GameCardResult[]>;
}
