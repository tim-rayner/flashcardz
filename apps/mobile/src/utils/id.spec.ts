import { createId } from './id';

describe('createId', () => {
  it('returns unique v4-shaped UUID strings', () => {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    const first = createId();
    const second = createId();

    expect(first).toMatch(uuidPattern);
    expect(second).toMatch(uuidPattern);
    expect(first).not.toEqual(second);
  });
});
