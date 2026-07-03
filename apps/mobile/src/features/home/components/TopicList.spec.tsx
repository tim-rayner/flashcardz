import { fireEvent, render } from '@testing-library/react-native';
import { Topic } from '../../../utils/storage/onboard-store';
import { TopicList } from './TopicList';

const topics: Topic[] = [
  { id: 'topic-1', name: 'SOLID Principles', createdAt: 1000 },
  { id: 'topic-2', name: 'French Vocab', createdAt: 2000 },
];

test('renders one topic card per topic', () => {
  const { getByTestId } = render(<TopicList topics={topics} />);

  expect(getByTestId('topic-card-topic-1')).toBeTruthy();
  expect(getByTestId('topic-card-topic-2')).toBeTruthy();
});

test('pads an odd number of topics with a spacer instead of stretching the last card', () => {
  const oddTopics: Topic[] = [
    ...topics,
    { id: 'topic-3', name: 'Kanji', createdAt: 3000 },
  ];

  const { getByTestId, queryAllByRole } = render(<TopicList topics={oddTopics} />);

  expect(getByTestId('topic-card-topic-3')).toBeTruthy();
  expect(queryAllByRole('button')).toHaveLength(3);
});

test('pulling to refresh calls onRefresh', () => {
  const onRefresh = jest.fn();
  const { getByTestId } = render(
    <TopicList topics={topics} onRefresh={onRefresh} isRefreshing={false} />,
  );

  fireEvent(getByTestId('topic-list'), 'refresh');

  expect(onRefresh).toHaveBeenCalled();
});
