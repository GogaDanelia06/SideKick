"use client";

import { useEffect, useRef } from "react";

export function useDismiss<T extends HTMLElement = HTMLDivElement>(
  open: boolean,
  onClose: (reason: "outside" | "escape") => void,
) {
  const ref = useRef<T>(null);

  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const el = ref.current;
      if (el && !el.contains(event.target as Node)) close.current("outside");
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close.current("escape");
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return ref;
}
