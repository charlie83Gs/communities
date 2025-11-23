import { createSignal, onCleanup } from 'solid-js';
import type { Accessor } from 'solid-js';

/**
 * Creates a debounced signal that separates immediate UI updates from delayed processing.
 * Useful for search inputs to prevent focus loss while maintaining reactivity.
 *
 * @param initialValue - Initial value for both signals
 * @param delay - Delay in milliseconds before updating debounced value (default: 300ms)
 * @returns Tuple of [immediateValue, debouncedValue, setValue]
 *
 * @example
 * const [displayValue, debouncedValue, setSearchValue] = createDebouncedSignal('', 300);
 *
 * // In input: value={displayValue()} onInput={(e) => setSearchValue(e.currentTarget.value)}
 * // In query: queryKey: ['search', debouncedValue()]
 */
export function createDebouncedSignal<T>(
  initialValue: T,
  delay: number = 300
): [Accessor<T>, Accessor<T>, (value: T) => void] {
  const [immediate, setImmediate] = createSignal<T>(initialValue);
  const [debounced, setDebounced] = createSignal<T>(initialValue);

  let timeoutId: number | undefined;

  const setValue = (value: T) => {
    setImmediate(() => value as any);

    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      setDebounced(() => value as any);
    }, delay) as unknown as number;
  };

  onCleanup(() => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  });

  return [immediate, debounced, setValue];
}
