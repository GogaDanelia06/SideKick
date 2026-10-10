"use client";

import { useRef, type ReactNode } from "react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";
import type { Outcome, Run } from "./useListEditor";

const SUBMIT = "h-9 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas disabled:opacity-60";

export function AddForm({
  create,
  run,
  onDone,
  pending,
  label,
  children,
}: {
  create: (fd: FormData) => Promise<Outcome>;
  run: Run;
  onDone: () => void;
  pending: boolean;
  label: Text;
  children: ReactNode;
}) {
  const { t } = useLanguage();
  const ref = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={ref}
      action={(fd) => run(() => create(fd), () => { ref.current?.reset(); onDone(); })}
      className="rounded-lg border border-border bg-card p-4"
    >
      {children}
      <div className="mt-3 flex justify-end">
        <button type="submit" disabled={pending} className={SUBMIT}>
          {pending ? "…" : t(label)}
        </button>
      </div>
    </form>
  );
}

export function EditForm({
  update,
  run,
  onDone,
  onCancel,
  pending,
  labels,
  children,
}: {
  update: (fd: FormData) => Promise<Outcome>;
  run: Run;
  onDone: () => void;
  onCancel: () => void;
  pending: boolean;
  labels: { cancel: Text; save: Text };
  children: ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <form action={(fd) => run(() => update(fd), onDone)}>
      {children}
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 rounded-[8px] border border-border px-4 text-[13px] font-medium"
        >
          {t(labels.cancel)}
        </button>
        <button type="submit" disabled={pending} className={SUBMIT}>
          {pending ? "…" : t(labels.save)}
        </button>
      </div>
    </form>
  );
}
