import { useCallback } from "react";
import { useSearchParams } from "next/navigation";

export function useUrlTab<T extends string>(
  name: string,
  tabs: readonly T[],
  fallback: T,
): [T, (tab: T) => void] {
  const value = useSearchParams().get(name);
  const tab = tabs.includes(value as T) ? (value as T) : fallback;

  const select = useCallback(
    (next: T) => {
      const url = new URL(window.location.href);
      if (next === fallback) url.searchParams.delete(name);
      else url.searchParams.set(name, next);
      window.history.replaceState(null, "", url);
    },
    [name, fallback],
  );

  return [tab, select];
}
