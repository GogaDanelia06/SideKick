"use client";

import { useEffect, useRef } from "react";

/**
 * Closes a popover on an outside pointerdown or Escape; attach the ref to everything
 * that counts as inside. A document listener avoids `fixed inset-0` overlays, which
 * break under ancestors with backdrop-filter or transform.
 */
export function useDismiss<T extends HTMLElement = HTMLDivElement>(
  open: boolean,
  onClose: () => void,
) {
  const ref = useRef<T>(null);

  // A ref, so an inline callback does not re-register the listeners on every render.
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const el = ref.current;
      if (el && !el.contains(event.target as Node)) close.current();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close.current();
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
