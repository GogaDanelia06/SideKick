import { useCallback } from "react";
import { useSearchParams } from "next/navigation";

/**
 * A tab kept in the URL (`?name=value`), so a refresh or a shared link reopens it.
 * replaceState updates the URL without a server request or an extra history entry.
 */
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
