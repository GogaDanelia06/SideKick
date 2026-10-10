import { useOptimistic, useState, useTransition } from "react";

export type Outcome = { ok: boolean; error?: string };
export type Run = (fn: () => Promise<Outcome>, onDone?: () => void) => void;

export function useListEditor<T extends { id: string }>(items: T[], deleteItem: (id: string) => Promise<Outcome>) {
  const [pending, start] = useTransition();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [visible, removeOptimistic] = useOptimistic(items, (rows: T[], id: string) =>
    rows.filter((r) => r.id !== id),
  );

  const run: Run = (fn, onDone) => {
    setError(null);
    start(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? "error");
      else onDone?.();
    });
  };

  function remove(id: string) {
    setError(null);
    start(async () => {
      removeOptimistic(id);
      const res = await deleteItem(id);
      if (!res.ok) setError(res.error ?? "error");
    });
  }

  return {
    visible,
    pending,
    error,
    adding,
    editing,
    run,
    remove,
    toggleAdding: () => {
      setAdding((v) => !v);
      setError(null);
    },
    closeAdding: () => setAdding(false),
    startEditing: (id: string) => {
      setEditing(id);
      setError(null);
    },
    finishEditing: () => setEditing(null),
    cancelEditing: () => {
      setEditing(null);
      setError(null);
    },
  };
}
