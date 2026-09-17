"use client";

import { useRef, useState } from "react";
import { useDismiss } from "@/hooks/useDismiss";

/**
 * Open state and placement for a popover anchored in `box`. It opens leftwards near the
 * right edge of the screen and upwards near the bottom, and closes on an outside click
 * or Escape; Escape hands focus back to the button that opened it.
 */
export function usePopover(size: { width: number; height: number }) {
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState({ right: false, up: false });
  const trigger = useRef<HTMLButtonElement>(null);
  const box = useDismiss<HTMLDivElement>(open, (reason) => (reason === "escape" ? close() : setOpen(false)));

  function toggle() {
    const r = box.current?.getBoundingClientRect();
    if (!open && r) {
      setPlace({
        right: r.left + size.width > window.innerWidth - 8,
        up: r.bottom + size.height > window.innerHeight && r.top > size.height,
      });
    }
    setOpen(!open);
  }

  /** Closes and gives focus back to the button that opened it. */
  function close() {
    setOpen(false);
    trigger.current?.focus();
  }

  return { open, place, box, trigger, toggle, close };
}
