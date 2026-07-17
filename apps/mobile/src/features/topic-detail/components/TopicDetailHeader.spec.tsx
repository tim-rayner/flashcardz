import { fireEvent, render, screen } from '@testing-library/react-native';
import { TopicDetailHeader } from './TopicDetailHeader';

test('disables the Start game button when there are no cards to play', () => {
  render(
    <TopicDetailHeader
      onManageCards={jest.fn()}
      onStartGame={jest.fn()}
      isStartGameDisabled
    />,
  );

  const button = screen.getByTestId('start-game-button');
  expect(button.props.accessibilityState).toEqual({ disabled: true });
});

test('calls onStartGame when Start game is pressed and enabled', () => {
  const onStartGame = jest.fn();
  render(
    <TopicDetailHeader
      onManageCards={jest.fn()}
      onStartGame={onStartGame}
      isStartGameDisabled={false}
    />,
  );

  fireEvent.press(screen.getByTestId('start-game-button'));

  expect(onStartGame).toHaveBeenCalledTimes(1);
});

test('calls onManageCards when the manage-cards button is pressed', () => {
  const onManageCards = jest.fn();
  render(
    <TopicDetailHeader
      onManageCards={onManageCards}
      onStartGame={jest.fn()}
      isStartGameDisabled
    />,
  );

  fireEvent.press(screen.getByTestId('manage-cards-button'));

  expect(onManageCards).toHaveBeenCalledTimes(1);
});
