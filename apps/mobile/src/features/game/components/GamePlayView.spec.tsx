import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { gameRepository } from '../data/gameRepository';
import { cardRepository } from '../data/cardRepository';
import { GamePlayView } from './GamePlayView';

jest.mock('../data/gameRepository', () => ({
  gameRepository: {
    createSession: jest.fn().mockResolvedValue(undefined),
    recordResult: jest.fn().mockResolvedValue(undefined),
    completeSession: jest.fn().mockResolvedValue(undefined),
    listResultsForSession: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('../data/cardRepository', () => ({
  cardRepository: {
    updateNotes: jest.fn().mockResolvedValue(undefined),
  },
}));

const oneCard = [{ id: 'card-1', question: 'What is SRP?', answer: 'Single Responsibility Principle' }];
const twoCards = [
  { id: 'card-1', question: 'What is SRP?', answer: 'Single Responsibility Principle' },
  { id: 'card-2', question: 'What is OCP?', answer: 'Open/Closed Principle' },
];

afterEach(() => {
  jest.restoreAllMocks();
});

test('shows the question and hides the answer until revealed', () => {
  render(<GamePlayView topicId="topic-1" cards={oneCard} onComplete={jest.fn()} />);

  expect(screen.getByText('What is SRP?')).toBeTruthy();
  expect(screen.queryByText('Single Responsibility Principle')).toBeNull();
  expect(screen.getByTestId('game-reveal-button')).toBeTruthy();
});

test('revealing shows the answer and the three grade buttons', () => {
  render(<GamePlayView topicId="topic-1" cards={oneCard} onComplete={jest.fn()} />);

  fireEvent.press(screen.getByTestId('game-reveal-button'));

  expect(screen.getByTestId('game-answer')).toHaveTextContent('Single Responsibility Principle');
  expect(screen.getByTestId('game-grade-correct')).toBeTruthy();
  expect(screen.getByTestId('game-grade-almost')).toBeTruthy();
  expect(screen.getByTestId('game-grade-incorrect')).toBeTruthy();
});

test('grading a non-final card advances to the next card and hides the answer', async () => {
  jest.spyOn(Math, 'random').mockReturnValue(0);
  render(<GamePlayView topicId="topic-1" cards={twoCards} onComplete={jest.fn()} />);
  expect(screen.getByText('What is OCP?')).toBeTruthy();
  fireEvent.press(screen.getByTestId('game-reveal-button'));

  fireEvent.press(screen.getByTestId('game-grade-correct'));

  await waitFor(() =>
    expect(screen.getByTestId('game-progress')).toHaveTextContent('Card 2 of 2'),
  );
  expect(screen.getByText('What is SRP?')).toBeTruthy();
  expect(screen.queryByTestId('game-answer')).toBeNull();
});

test('grading the final card calls onComplete with the session id', async () => {
  jest.spyOn(Math, 'random').mockReturnValue(0);
  const onComplete = jest.fn();
  render(<GamePlayView topicId="topic-1" cards={oneCard} onComplete={onComplete} />);

  fireEvent.press(screen.getByTestId('game-reveal-button'));
  fireEvent.press(screen.getByTestId('game-grade-correct'));

  await waitFor(() => expect(onComplete).toHaveBeenCalledWith(expect.any(String)));
  expect(gameRepository.completeSession).toHaveBeenCalled();
});

test('the notes field is pre-filled with the card\'s existing notes once revealed', () => {
  const cardsWithNotes = [
    { id: 'card-1', question: 'What is SRP?', answer: 'Single Responsibility Principle', notes: 'Remember: one reason to change' },
  ];
  render(<GamePlayView topicId="topic-1" cards={cardsWithNotes} onComplete={jest.fn()} />);

  fireEvent.press(screen.getByTestId('game-reveal-button'));

  expect(screen.getByTestId('game-notes-input')).toHaveProp(
    'value',
    'Remember: one reason to change',
  );
});

test('blurring the notes field saves the note against the current card', () => {
  render(<GamePlayView topicId="topic-1" cards={oneCard} onComplete={jest.fn()} />);

  fireEvent.press(screen.getByTestId('game-reveal-button'));
  fireEvent.changeText(screen.getByTestId('game-notes-input'), 'SRP = single responsibility');
  fireEvent(screen.getByTestId('game-notes-input'), 'blur');

  expect(cardRepository.updateNotes).toHaveBeenCalledWith(
    'card-1',
    'SRP = single responsibility',
  );
});

test('grading flushes an unsaved note before advancing', async () => {
  jest.spyOn(Math, 'random').mockReturnValue(0);
  render(<GamePlayView topicId="topic-1" cards={twoCards} onComplete={jest.fn()} />);

  fireEvent.press(screen.getByTestId('game-reveal-button'));
  fireEvent.changeText(screen.getByTestId('game-notes-input'), 'a mnemonic');
  fireEvent.press(screen.getByTestId('game-grade-correct'));

  expect(cardRepository.updateNotes).toHaveBeenCalledWith('card-2', 'a mnemonic');
  await waitFor(() =>
    expect(screen.getByTestId('game-progress')).toHaveTextContent('Card 2 of 2'),
  );
});
