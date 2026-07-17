import { computeGameScore } from './gameScore.js';

test('counts correct, almost, and incorrect results separately', () => {
  const score = computeGameScore(['correct', 'correct', 'almost', 'incorrect']);

  expect(score).toEqual({ correct: 2, almost: 1, incorrect: 1, ratio: 0.5 });
});

test('almost earns no credit toward the ratio', () => {
  const score = computeGameScore(['almost', 'almost', 'almost']);

  expect(score).toEqual({ correct: 0, almost: 3, incorrect: 0, ratio: 0 });
});

test('ratio is 0 for an empty result set, not NaN', () => {
  const score = computeGameScore([]);

  expect(score).toEqual({ correct: 0, almost: 0, incorrect: 0, ratio: 0 });
});
