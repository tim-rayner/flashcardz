import { renderHook, waitFor } from '@testing-library/react-native';
import { OnboardStore } from '../../../utils/storage/onboard-store';
import { useTopic } from './useTopic';

jest.mock('../../../utils/storage/onboard-store', () => ({
  OnboardStore: {
    get: jest.fn(),
  },
}));

const mockGet = OnboardStore.get as jest.Mock;

beforeEach(() => {
  mockGet.mockReset();
});

test('loads the topic by id', async () => {
  const topic = { id: 'topic-1', name: 'Spanish', createdAt: 1000 };
  mockGet.mockResolvedValueOnce(topic);

  const { result } = renderHook(() => useTopic('topic-1'));
  expect(result.current.isLoading).toBe(true);

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  expect(result.current.topic).toEqual(topic);
  expect(mockGet).toHaveBeenCalledWith('topics', { id: 'topic-1' });
});

test('resolves to null when the topic does not exist', async () => {
  mockGet.mockResolvedValueOnce(null);

  const { result } = renderHook(() => useTopic('missing'));
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  expect(result.current.topic).toBeNull();
});
