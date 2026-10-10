"use client";

import clsx from "clsx";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

type Side = "left" | "right";

const SIDES = {
  left: { Icon: IconChevronLeft, label: "Previous slide" },
  right: { Icon: IconChevronRight, label: "Next slide" },
};

export function Arrow({ side, onClick }: { side: Side; onClick: () => void }) {
  const { Icon, label } = SIDES[side];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={clsx(
        "absolute top-1/2 z-[3] hidden size-11 -translate-y-1/2",
        "place-items-center rounded-full border-2 border-input bg-card",
        "text-ink shadow-[0_4px_14px_rgba(0,0,0,0.25)] xl:grid",
        side === "left" ? "-left-16" : "-right-16",
      )}
    >
      <Icon size={22} />
    </button>
  );
}

export function Stepper({ side, onClick }: { side: Side; onClick: () => void }) {
  const { Icon, label } = SIDES[side];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={clsx(
        "grid size-9 shrink-0 place-items-center rounded-full",
        "border border-input bg-card text-ink xl:hidden",
      )}
    >
      <Icon size={18} />
    </button>
  );
}
