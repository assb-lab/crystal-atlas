import { useCallback, useSyncExternalStore, type Dispatch, type SetStateAction } from "react";
// Per-page navigation state survives tab/component unmounts. It never stores DB handles/results.
const values = new Map<string, unknown>();
const listeners = new Map<string, Set<() => void>>();
export function useViewState<T>(
  key: string,
  initial: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] {
  if (!values.has(key))
    values.set(key, typeof initial === "function" ? (initial as () => T)() : initial);
  const subscribe = useCallback(
    (notify: () => void) => {
      let set = listeners.get(key);
      if (!set) {
        set = new Set();
        listeners.set(key, set);
      }
      set.add(notify);
      return () => {
        set!.delete(notify);
      };
    },
    [key],
  );
  const snapshot = useCallback(() => values.get(key) as T, [key]);
  const value = useSyncExternalStore(subscribe, snapshot, snapshot);
  const update: Dispatch<SetStateAction<T>> = useCallback(
    (next) => {
      const old = values.get(key) as T;
      const value = typeof next === "function" ? (next as (old: T) => T)(old) : next;
      if (Object.is(old, value)) return;
      values.set(key, value);
      listeners.get(key)?.forEach((notify) => notify());
    },
    [key],
  );
  return [value, update];
}
