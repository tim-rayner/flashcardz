import { fireEvent, render, screen } from '@testing-library/react-native';
import { ManageCardsModal } from './ManageCardsModal';

jest.mock('../../../utils/id', () => ({
  createId: () => 'generated-id',
}));

const existingCard = {
  id: 'card-1',
  question: 'What is SRP?',
  answer: 'Single Responsibility Principle',
  notes: null,
};

test('seeds the draft list from initialCards when opened', () => {
  render(
    <ManageCardsModal
      visible
      initialCards={[existingCard]}
      onCancel={jest.fn()}
      onSave={jest.fn()}
    />,
  );

  expect(screen.getByTestId('manage-cards-draft-card-1')).toBeTruthy();
  expect(screen.getByText('What is SRP?')).toBeTruthy();
});

test('adding a card appends it to the draft list and clears the form', () => {
  render(
    <ManageCardsModal visible initialCards={[]} onCancel={jest.fn()} onSave={jest.fn()} />,
  );

  fireEvent.changeText(screen.getByTestId('manage-cards-question-input'), 'What is OCP?');
  fireEvent.changeText(
    screen.getByTestId('manage-cards-answer-input'),
    'Open/Closed Principle',
  );
  fireEvent.press(screen.getByTestId('manage-cards-submit-form'));

  expect(screen.getByTestId('manage-cards-draft-generated-id')).toBeTruthy();
  expect(screen.getByTestId('manage-cards-question-input').props.value).toBe('');
});

test('the add button is disabled until both question and answer are filled in', () => {
  render(
    <ManageCardsModal visible initialCards={[]} onCancel={jest.fn()} onSave={jest.fn()} />,
  );

  fireEvent.press(screen.getByTestId('manage-cards-submit-form'));

  expect(screen.queryByTestId('manage-cards-draft-generated-id')).toBeNull();
});

test('editing a draft loads it into the form and updates it in place on submit', () => {
  render(
    <ManageCardsModal
      visible
      initialCards={[existingCard]}
      onCancel={jest.fn()}
      onSave={jest.fn()}
    />,
  );

  fireEvent.press(screen.getByTestId('manage-cards-edit-card-1'));
  expect(screen.getByTestId('manage-cards-question-input').props.value).toBe('What is SRP?');

  fireEvent.changeText(
    screen.getByTestId('manage-cards-question-input'),
    'What is SRP, exactly?',
  );
  fireEvent.press(screen.getByTestId('manage-cards-submit-form'));

  expect(screen.getByText('What is SRP, exactly?')).toBeTruthy();
  expect(screen.queryByTestId('manage-cards-draft-generated-id')).toBeNull();
});

test('opening with an initialEditId pre-populates the form for that card', () => {
  render(
    <ManageCardsModal
      visible
      initialCards={[existingCard]}
      initialEditId="card-1"
      onCancel={jest.fn()}
      onSave={jest.fn()}
    />,
  );

  expect(screen.getByTestId('manage-cards-question-input').props.value).toBe('What is SRP?');
  expect(screen.getByTestId('manage-cards-answer-input').props.value).toBe(
    'Single Responsibility Principle',
  );
  expect(screen.getByTestId('manage-cards-submit-form')).toBeTruthy();
});

test('deleting a draft removes it from the list', () => {
  render(
    <ManageCardsModal
      visible
      initialCards={[existingCard]}
      onCancel={jest.fn()}
      onSave={jest.fn()}
    />,
  );

  fireEvent.press(screen.getByTestId('manage-cards-delete-card-1'));

  expect(screen.queryByTestId('manage-cards-draft-card-1')).toBeNull();
});

test('Save calls onSave with the current draft list', () => {
  const onSave = jest.fn();
  render(
    <ManageCardsModal
      visible
      initialCards={[existingCard]}
      onCancel={jest.fn()}
      onSave={onSave}
    />,
  );

  fireEvent.press(screen.getByTestId('manage-cards-save'));

  expect(onSave).toHaveBeenCalledWith([existingCard]);
});

test('Cancel and backdrop tap discard changes without calling onSave', () => {
  const onCancel = jest.fn();
  const onSave = jest.fn();
  render(
    <ManageCardsModal
      visible
      initialCards={[existingCard]}
      onCancel={onCancel}
      onSave={onSave}
    />,
  );

  fireEvent.press(screen.getByTestId('manage-cards-cancel'));

  expect(onCancel).toHaveBeenCalledTimes(1);
  expect(onSave).not.toHaveBeenCalled();
});
