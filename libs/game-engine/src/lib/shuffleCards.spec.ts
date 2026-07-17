import { shuffleCards } from './shuffleCards.js';

test('returns a permutation containing exactly the same elements as the input', () => {
  const cards = ['a', 'b', 'c', 'd', 'e'];

  const shuffled = shuffleCards(cards);

  expect(shuffled).toHaveLength(cards.length);
  expect([...shuffled].sort()).toEqual([...cards].sort());
});

test('does not mutate the input array', () => {
  const cards = ['a', 'b', 'c'];

  shuffleCards(cards);

  expect(cards).toEqual(['a', 'b', 'c']);
});

test('produces a deterministic order for an injected random source', () => {
  const cards = ['a', 'b', 'c', 'd'];
  const sequence = [0, 0, 0];
  let index = 0;
  const random = () => sequence[index++];

  const shuffled = shuffleCards(cards, random);

  expect(shuffled).toEqual(['b', 'c', 'd', 'a']);
});
