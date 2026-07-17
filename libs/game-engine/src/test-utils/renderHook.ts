import { act, create } from 'react-test-renderer';
import { createElement } from 'react';

/**
 * A minimal, platform-agnostic renderHook - avoids depending on
 * @testing-library/react-native (RN-specific) so this lib's own tests stay
 * portable to non-RN consumers, matching the engine's platform-agnostic
 * design goal.
 */
export function renderHook<T>(hook: () => T): { result: { current: T } } {
  const result = { current: undefined as unknown as T };

  function TestComponent() {
    result.current = hook();
    return null;
  }

  act(() => {
    create(createElement(TestComponent));
  });

  return { result };
}
