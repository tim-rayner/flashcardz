import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';
import { useTopics } from './hooks/useTopics';
import { HomeScreen } from './HomeScreen';

jest.mock('./hooks/useTopics', () => ({ useTopics: jest.fn() }));
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

const mockUseTopics = useTopics as jest.Mock;

test('shows the empty state when there are no topics', () => {
  mockUseTopics.mockReturnValue({
    topics: [],
    isLoading: false,
    createTopic: jest.fn(),
  });

  const { getByTestId } = render(<HomeScreen />);

  expect(getByTestId('empty-topics-view')).toBeTruthy();
});

test('shows the topic list once topics exist', () => {
  mockUseTopics.mockReturnValue({
    topics: [{ id: 'topic-1', name: 'SOLID Principles', createdAt: 1000 }],
    isLoading: false,
    createTopic: jest.fn(),
  });

  const { getByTestId, queryByTestId } = render(<HomeScreen />);

  expect(getByTestId('topic-list')).toBeTruthy();
  expect(queryByTestId('empty-topics-view')).toBeNull();
});

test('tapping the + button opens the create-topic modal and submitting calls createTopic', () => {
  const createTopic = jest.fn().mockResolvedValue(undefined);
  mockUseTopics.mockReturnValue({ topics: [], isLoading: false, createTopic });

  const { getByTestId } = render(<HomeScreen />);

  fireEvent.press(getByTestId('create-topic-button'));
  fireEvent.changeText(getByTestId('create-topic-input'), 'Kanji');
  fireEvent.press(getByTestId('create-topic-submit'));

  expect(createTopic).toHaveBeenCalledWith('Kanji');
});

test('tapping a topic navigates to its detail route', () => {
  mockUseTopics.mockReturnValue({
    topics: [{ id: 'topic-1', name: 'SOLID Principles', createdAt: 1000 }],
    isLoading: false,
    createTopic: jest.fn(),
  });

  const { getByTestId } = render(<HomeScreen />);

  fireEvent.press(getByTestId('topic-card-topic-1'));

  expect(router.push).toHaveBeenCalledWith('/topics/topic-1');
});
