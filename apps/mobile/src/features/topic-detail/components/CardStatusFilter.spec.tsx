import { fireEvent, render, screen } from '@testing-library/react-native';
import { CardStatusFilter } from './CardStatusFilter';

test('renders a chip for every status filter and marks the active one selected', () => {
  render(<CardStatusFilter value="correct" onChange={jest.fn()} />);

  expect(screen.getByText('All')).toBeTruthy();
  expect(screen.getByText('Never answered')).toBeTruthy();
  expect(screen.getByText('Correct')).toBeTruthy();
  expect(screen.getByText('Incorrect')).toBeTruthy();
  expect(screen.getByText('Almost')).toBeTruthy();

  expect(screen.getByTestId('card-status-filter-chip-correct').props.accessibilityState).toEqual({
    selected: true,
  });
  expect(screen.getByTestId('card-status-filter-chip-all').props.accessibilityState).toEqual({
    selected: false,
  });
});

test('calls onChange with the tapped filter', () => {
  const onChange = jest.fn();
  render(<CardStatusFilter value="all" onChange={onChange} />);

  fireEvent.press(screen.getByTestId('card-status-filter-chip-incorrect'));

  expect(onChange).toHaveBeenCalledWith('incorrect');
});
