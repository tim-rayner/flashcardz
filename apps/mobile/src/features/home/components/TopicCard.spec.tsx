import { fireEvent, render } from '@testing-library/react-native';
import { Topic } from '../../../utils/storage/onboard-store';
import { TopicCard } from './TopicCard';

const topic: Topic = { id: 'topic-1', name: 'SOLID Principles', createdAt: 1000 };

test('renders the topic name', () => {
  const { getByText } = render(<TopicCard topic={topic} size={150} />);

  expect(getByText('SOLID Principles')).toBeTruthy();
});

test('calls onPress with the topic when tapped', () => {
  const onPress = jest.fn();
  const { getByTestId } = render(<TopicCard topic={topic} onPress={onPress} size={150} />);

  fireEvent.press(getByTestId('topic-card-topic-1'));

  expect(onPress).toHaveBeenCalledWith(topic);
});
