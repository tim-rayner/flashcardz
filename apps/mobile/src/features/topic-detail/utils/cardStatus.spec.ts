import { getLatestCardStatuses, isCardStatusFilter } from './cardStatus';

describe('isCardStatusFilter', () => {
  it('accepts every known filter value', () => {
    expect(isCardStatusFilter('all')).toBe(true);
    expect(isCardStatusFilter('never')).toBe(true);
    expect(isCardStatusFilter('correct')).toBe(true);
    expect(isCardStatusFilter('incorrect')).toBe(true);
    expect(isCardStatusFilter('almost')).toBe(true);
  });

  it('rejects unknown or missing values', () => {
    expect(isCardStatusFilter('bogus')).toBe(false);
    expect(isCardStatusFilter(undefined)).toBe(false);
  });
});

describe('getLatestCardStatuses', () => {
  it('returns an empty map when there are no results', () => {
    expect(getLatestCardStatuses([])).toEqual(new Map());
  });

  it('maps a card to its only result', () => {
    const statuses = getLatestCardStatuses([
      { sessionId: 's1', cardId: 'c1', result: 'correct', answeredAt: 100 },
    ]);

    expect(statuses.get('c1')).toBe('correct');
  });

  it('keeps the most recent result when a card has been answered multiple times', () => {
    const statuses = getLatestCardStatuses([
      { sessionId: 's1', cardId: 'c1', result: 'incorrect', answeredAt: 100 },
      { sessionId: 's2', cardId: 'c1', result: 'correct', answeredAt: 200 },
    ]);

    expect(statuses.get('c1')).toBe('correct');
  });

  it('is unaffected by the input order of results', () => {
    const statuses = getLatestCardStatuses([
      { sessionId: 's2', cardId: 'c1', result: 'correct', answeredAt: 200 },
      { sessionId: 's1', cardId: 'c1', result: 'incorrect', answeredAt: 100 },
    ]);

    expect(statuses.get('c1')).toBe('correct');
  });

  it('tracks statuses independently per card', () => {
    const statuses = getLatestCardStatuses([
      { sessionId: 's1', cardId: 'c1', result: 'correct', answeredAt: 100 },
      { sessionId: 's1', cardId: 'c2', result: 'almost', answeredAt: 150 },
    ]);

    expect(statuses.get('c1')).toBe('correct');
    expect(statuses.get('c2')).toBe('almost');
  });
});
