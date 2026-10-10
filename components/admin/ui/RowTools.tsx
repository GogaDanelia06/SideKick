"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import { IconChevronDown, IconChevronUp, IconEye, IconEyeOff, IconPencil, IconTrash } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";

export type RowLabels = { up: Text; down: Text; toggle?: Text; edit: Text; remove: Text };

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  faded,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  danger?: boolean;
  faded?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className={clsx(
        "grid size-8 place-items-center rounded-[7px] border border-border",
        danger ? "text-red hover:border-red" : "text-muted hover:text-ink",
        faded ? "disabled:opacity-30" : "disabled:opacity-40",
      )}
    >
      {children}
    </button>
  );
}

export function RowTools({
  first,
  last,
  pending,
  published,
  labels,
  onMove,
  onToggle,
  onEdit,
  onRemove,
  className = "flex shrink-0 items-center gap-1",
}: {
  first: boolean;
  last: boolean;
  pending: boolean;
  published?: boolean;
  labels: RowLabels;
  onMove: (direction: "up" | "down") => void;
  onToggle?: () => void;
  onEdit: () => void;
  onRemove: () => void;
  className?: string;
}) {
  const { t } = useLanguage();

  return (
    <div className={className}>
      <IconButton faded label={t(labels.up)} disabled={pending || first} onClick={() => onMove("up")}>
        <IconChevronUp size={16} />
      </IconButton>
      <IconButton faded label={t(labels.down)} disabled={pending || last} onClick={() => onMove("down")}>
        <IconChevronDown size={16} />
      </IconButton>
      {onToggle && labels.toggle ? (
        <IconButton label={t(labels.toggle)} disabled={pending} onClick={onToggle}>
          {published ? <IconEye size={15} /> : <IconEyeOff size={15} />}
        </IconButton>
      ) : null}
      <IconButton label={t(labels.edit)} disabled={pending} onClick={onEdit}>
        <IconPencil size={15} />
      </IconButton>
      <IconButton danger label={t(labels.remove)} disabled={pending} onClick={onRemove}>
        <IconTrash size={15} />
      </IconButton>
    </div>
  );
}
