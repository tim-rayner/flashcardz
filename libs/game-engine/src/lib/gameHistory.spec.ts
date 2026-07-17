import { summarizeGameHistory } from './gameHistory.js';

test('orders entries newest Game first regardless of input order', () => {
  const summary = summarizeGameHistory([
    {
      session: { id: 'older', topicId: 't1', startedAt: 100, completedAt: 150 },
      results: ['correct'],
    },
    {
      session: { id: 'newer', topicId: 't1', startedAt: 300, completedAt: 350 },
      results: ['incorrect'],
    },
  ]);

  expect(summary.entries.map((entry) => entry.session.id)).toEqual(['newer', 'older']);
});

test('excludes an Abandoned Game from gamesPlayed and averageRatio, but keeps it in entries', () => {
  const summary = summarizeGameHistory([
    {
      session: { id: 'completed', topicId: 't1', startedAt: 100, completedAt: 150 },
      results: ['correct', 'incorrect'],
    },
    {
      session: { id: 'abandoned', topicId: 't1', startedAt: 300, completedAt: null },
      results: ['correct', 'correct'],
    },
  ]);

  expect(summary.gamesPlayed).toBe(1);
  expect(summary.averageRatio).toBeCloseTo(0.5);
  expect(summary.entries.map((entry) => entry.session.id)).toEqual(['abandoned', 'completed']);
});

test('summarizes an empty history without dividing by zero', () => {
  const summary = summarizeGameHistory([]);

  expect(summary).toEqual({ entries: [], gamesPlayed: 0, averageRatio: 0 });
});

test('summarizes a single Completed Game', () => {
  const summary = summarizeGameHistory([
    {
      session: { id: 's1', topicId: 't1', startedAt: 100, completedAt: 200 },
      results: ['correct', 'correct', 'incorrect'],
    },
  ]);

  expect(summary.gamesPlayed).toBe(1);
  expect(summary.averageRatio).toBeCloseTo(2 / 3);
  expect(summary.entries).toEqual([
    {
      session: { id: 's1', topicId: 't1', startedAt: 100, completedAt: 200 },
      score: { correct: 2, almost: 0, incorrect: 1, ratio: 2 / 3 },
    },
  ]);
});
