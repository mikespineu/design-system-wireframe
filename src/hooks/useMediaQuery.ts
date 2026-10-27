import { useCallback, useSyncExternalStore } from 'react';

export interface UseMediaQueryOptions {
  /** Value on the server and during hydration. */
  defaultValue?: boolean;
}

/** Live `window.matchMedia(query).matches`. SSR-safe: the server snapshot is `defaultValue`. */
export const useMediaQuery = (query: string, { defaultValue = false }: UseMediaQueryOptions = {}): boolean => {
  const subscribe = useCallback(
    (notify: () => void) => {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener('change', notify);
      return () => mql.removeEventListener('change', notify);
    },
    [query],
  );
  const getSnapshot = () =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches
      : defaultValue;
  return useSyncExternalStore(subscribe, getSnapshot, () => defaultValue);
};
