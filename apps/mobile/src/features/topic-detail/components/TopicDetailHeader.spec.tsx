import { fireEvent, render, screen } from '@testing-library/react-native';
import { TopicDetailHeader } from './TopicDetailHeader';

test('renders a disabled Start game button', () => {
  render(<TopicDetailHeader onManageCards={jest.fn()} />);

  const button = screen.getByTestId('start-game-button');
  expect(button.props.accessibilityState).toEqual({ disabled: true });
});

test('calls onManageCards when the manage-cards button is pressed', () => {
  const onManageCards = jest.fn();
  render(<TopicDetailHeader onManageCards={onManageCards} />);

  fireEvent.press(screen.getByTestId('manage-cards-button'));

  expect(onManageCards).toHaveBeenCalledTimes(1);
});
