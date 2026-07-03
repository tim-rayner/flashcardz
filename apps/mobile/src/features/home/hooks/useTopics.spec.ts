import { act, renderHook, waitFor } from '@testing-library/react-native';
import { OnboardStore } from '../../../utils/storage/onboard-store';
import { useTopics } from './useTopics';

jest.mock('../../../utils/storage/onboard-store', () => ({
  OnboardStore: {
    list: jest.fn(),
    set: jest.fn(),
  },
}));

jest.mock('../../../utils/id', () => ({
  createId: () => 'generated-id',
}));

const mockList = OnboardStore.list as jest.Mock;
const mockSet = OnboardStore.set as jest.Mock;

const existingTopic = {
  id: 'topic-1',
  name: 'SOLID Principles',
  createdAt: 1000,
};

beforeEach(() => {
  mockList.mockReset().mockResolvedValue([existingTopic]);
  mockSet.mockReset().mockResolvedValue(undefined);
});

test('loads topics ordered newest-first on mount', async () => {
  const { result } = renderHook(() => useTopics());

  expect(result.current.isLoading).toBe(true);

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  expect(result.current.topics).toEqual([existingTopic]);
  expect(mockList).toHaveBeenCalledWith('topics', {
    orderBy: 'created_at',
    direction: 'DESC',
  });
});

test('createTopic writes a new topic row then reloads the list', async () => {
  const { result } = renderHook(() => useTopics());
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  const newTopic = { id: 'generated-id', name: 'Kanji', createdAt: 5000 };
  mockList.mockResolvedValueOnce([newTopic, existingTopic]);
  jest.spyOn(Date, 'now').mockReturnValue(5000);

  await act(async () => {
    await result.current.createTopic('Kanji');
  });

  expect(mockSet).toHaveBeenCalledWith('topics', newTopic);
  expect(result.current.topics).toEqual([newTopic, existingTopic]);
});

test('createTopic ignores blank names', async () => {
  const { result } = renderHook(() => useTopics());
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  await act(async () => {
    await result.current.createTopic('   ');
  });

  expect(mockSet).not.toHaveBeenCalled();
});

test('refresh reloads topics and toggles isRefreshing', async () => {
  const { result } = renderHook(() => useTopics());
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  const refreshedTopic = { id: 'topic-2', name: 'French Vocab', createdAt: 6000 };
  mockList.mockResolvedValueOnce([refreshedTopic, existingTopic]);

  await act(async () => {
    await result.current.refresh();
  });

  expect(result.current.isRefreshing).toBe(false);
  expect(result.current.topics).toEqual([refreshedTopic, existingTopic]);
  expect(mockList).toHaveBeenCalledTimes(2);
});
