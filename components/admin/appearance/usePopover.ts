"use client";

import { useRef, useState } from "react";
import { useDismiss } from "@/hooks/useDismiss";

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

  function close() {
    setOpen(false);
    trigger.current?.focus();
  }

  return { open, place, box, trigger, toggle, close };
}
