"use client";

import type { ReactNode } from "react";
import { IconPlus, IconX } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";

export function EditorBar({
  count,
  noun,
  adding,
  addLabel,
  closeLabel,
  onToggle,
}: {
  count: number;
  noun: Text;
  adding: boolean;
  addLabel: Text;
  closeLabel: Text;
  onToggle: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted">
        {count} {t(noun)}
      </span>
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas"
      >
        {adding ? <IconX size={16} /> : <IconPlus size={16} />}
        {adding ? t(closeLabel) : t(addLabel)}
      </button>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card px-6 py-10 text-center text-sm text-muted">{children}</div>
  );
}

export function ItemCard({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-border bg-card p-4">{children}</div>;
}
