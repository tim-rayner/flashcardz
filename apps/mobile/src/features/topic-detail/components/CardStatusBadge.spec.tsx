import { render, screen } from '@testing-library/react-native';
import { CardStatusBadge } from './CardStatusBadge';

test.each([
  ['never', 'Never answered'],
  ['correct', 'Correct'],
  ['incorrect', 'Incorrect'],
  ['almost', 'Almost'],
] as const)('renders the label for status %s', (status, label) => {
  render(<CardStatusBadge status={status} />);

  expect(screen.getByTestId(`card-status-badge-${status}`)).toBeTruthy();
  expect(screen.getByText(label)).toBeTruthy();
});
