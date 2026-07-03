import { fireEvent, render } from '@testing-library/react-native';
import { CreateTopicModal } from './CreateTopicModal';

test('disables submit until a name is entered, then submits the trimmed name', () => {
  const onSubmit = jest.fn();
  const onCancel = jest.fn();
  const { getByTestId } = render(
    <CreateTopicModal visible onCancel={onCancel} onSubmit={onSubmit} />,
  );

  fireEvent.press(getByTestId('create-topic-submit'));
  expect(onSubmit).not.toHaveBeenCalled();

  fireEvent.changeText(
    getByTestId('create-topic-input'),
    '  SOLID Principles  ',
  );
  fireEvent.press(getByTestId('create-topic-submit'));

  expect(onSubmit).toHaveBeenCalledWith('SOLID Principles');
});

test('tapping the backdrop dismisses the sheet without submitting', () => {
  const onSubmit = jest.fn();
  const onCancel = jest.fn();
  const { getByTestId } = render(
    <CreateTopicModal visible onCancel={onCancel} onSubmit={onSubmit} />,
  );

  fireEvent.changeText(getByTestId('create-topic-input'), 'Kanji');
  fireEvent.press(getByTestId('create-topic-backdrop'));

  expect(onCancel).toHaveBeenCalledTimes(1);
  expect(onSubmit).not.toHaveBeenCalled();
});

test('cancel clears the input and calls onCancel', () => {
  const onSubmit = jest.fn();
  const onCancel = jest.fn();
  const { getByTestId } = render(
    <CreateTopicModal visible onCancel={onCancel} onSubmit={onSubmit} />,
  );

  fireEvent.changeText(getByTestId('create-topic-input'), 'Kanji');
  fireEvent.press(getByTestId('create-topic-cancel'));

  expect(onCancel).toHaveBeenCalledTimes(1);
  expect(onSubmit).not.toHaveBeenCalled();
});
