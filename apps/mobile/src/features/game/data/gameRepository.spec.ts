import { OnboardStore } from '../../../utils/storage/onboard-store';
import { gameRepository } from './gameRepository';

jest.mock('../../../utils/storage/onboard-store', () => ({
  OnboardStore: {
    get: jest.fn(),
    set: jest.fn(),
    list: jest.fn(),
  },
}));

const mockGet = OnboardStore.get as jest.Mock;
const mockSet = OnboardStore.set as jest.Mock;
const mockList = OnboardStore.list as jest.Mock;

beforeEach(() => {
  mockGet.mockReset();
  mockSet.mockReset().mockResolvedValue(undefined);
  mockList.mockReset().mockResolvedValue([]);
});

test('createSession upserts a sessions row', async () => {
  await gameRepository.createSession({
    id: 'session-1',
    topicId: 'topic-1',
    startedAt: 1000,
    completedAt: null,
  });

  expect(mockSet).toHaveBeenCalledWith('sessions', {
    id: 'session-1',
    topicId: 'topic-1',
    startedAt: 1000,
    completedAt: null,
  });
});

test('recordResult upserts a card_results row', async () => {
  await gameRepository.recordResult({
    sessionId: 'session-1',
    cardId: 'card-1',
    result: 'correct',
    answeredAt: 2000,
  });

  expect(mockSet).toHaveBeenCalledWith('card_results', {
    sessionId: 'session-1',
    cardId: 'card-1',
    result: 'correct',
    answeredAt: 2000,
  });
});

test('completeSession merges completedAt into the existing session row', async () => {
  mockGet.mockResolvedValue({
    id: 'session-1',
    topicId: 'topic-1',
    startedAt: 1000,
    completedAt: null,
  });

  await gameRepository.completeSession('session-1', 5000);

  expect(mockGet).toHaveBeenCalledWith('sessions', { id: 'session-1' });
  expect(mockSet).toHaveBeenCalledWith('sessions', {
    id: 'session-1',
    topicId: 'topic-1',
    startedAt: 1000,
    completedAt: 5000,
  });
});

test('completeSession is a no-op when the session no longer exists', async () => {
  mockGet.mockResolvedValue(null);

  await gameRepository.completeSession('missing-session', 5000);

  expect(mockSet).not.toHaveBeenCalled();
});

test('listResultsForSession lists card_results scoped to the session', async () => {
  const rows = [
    { sessionId: 'session-1', cardId: 'card-1', result: 'correct', answeredAt: 2000 },
  ];
  mockList.mockResolvedValue(rows);

  const results = await gameRepository.listResultsForSession('session-1');

  expect(mockList).toHaveBeenCalledWith('card_results', {
    where: { session_id: 'session-1' },
  });
  expect(results).toEqual(rows);
});
