import { fireEvent, render } from '@testing-library/react-native';
import { EmptyTopicsView } from './EmptyTopicsView';

test('shows a competence-oriented invitation to create the first topic', () => {
  const { getByTestId, getByText } = render(
    <EmptyTopicsView onCreateTopic={jest.fn()} />,
  );

  expect(getByTestId('empty-topics-view')).toBeTruthy();
  expect(getByText('Your first topic is one tap away')).toBeTruthy();
});

test('triggers onCreateTopic when the CTA is pressed', () => {
  const onCreateTopic = jest.fn();
  const { getByTestId } = render(<EmptyTopicsView onCreateTopic={onCreateTopic} />);

  fireEvent.press(getByTestId('empty-topics-cta'));

  expect(onCreateTopic).toHaveBeenCalledTimes(1);
});
