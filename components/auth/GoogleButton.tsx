"use client";

import { IconBrandGoogle } from "@tabler/icons-react";

export function GoogleButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-[18px] inline-flex h-[42px] w-full items-center justify-center gap-2.5 rounded-sm border border-input bg-card2 text-sm font-medium text-ink"
    >
      <IconBrandGoogle size={18} />
      {label}
    </button>
  );
}
