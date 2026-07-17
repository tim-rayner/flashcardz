import { Result } from './types.js';

export interface GameScore {
  correct: number;
  almost: number;
  incorrect: number;
  ratio: number;
}

export function computeGameScore(results: Result[]): GameScore {
  const correct = results.filter((result) => result === 'correct').length;
  const almost = results.filter((result) => result === 'almost').length;
  const incorrect = results.filter((result) => result === 'incorrect').length;

  return {
    correct,
    almost,
    incorrect,
    ratio: results.length === 0 ? 0 : correct / results.length,
  };
}
