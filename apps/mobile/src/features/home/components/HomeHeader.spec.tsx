import { fireEvent, render } from '@testing-library/react-native';
import { HomeHeader } from './HomeHeader';

test('renders the screen title and triggers onCreateTopic when the + button is pressed', () => {
  const onCreateTopic = jest.fn();
  const { getByText, getByTestId } = render(
    <HomeHeader onCreateTopic={onCreateTopic} />,
  );

  expect(getByText('Your Topics')).toBeTruthy();

  fireEvent.press(getByTestId('create-topic-button'));

  expect(onCreateTopic).toHaveBeenCalledTimes(1);
});
