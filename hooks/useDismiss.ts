"use client";

import { useEffect, useRef } from "react";

/**
 * Closes a popover when the pointer goes down outside it, or on Escape.
 *
 * Replaces the full-screen invisible button these menus used to sit behind.
 * That trick breaks in a way that is hard to spot: an ancestor with
 * `backdrop-filter`, `filter` or `transform` becomes the containing block for
 * its fixed-position descendants, so `fixed inset-0` stops meaning "the
 * viewport" and starts meaning "that ancestor". The site header has
 * `backdrop-blur`, which left the language menu's overlay 64px tall — the menu
 * closed when you clicked the header and stayed open everywhere else.
 *
 * A document listener has no such geometry to get wrong. It also lets the click
 * through, so dismissing a menu and pressing the thing underneath is one action
 * rather than two.
 *
 * Attach the returned ref to the element that counts as "inside" — trigger and
 * panel together, or the panel alone if the trigger toggles.
 */
export function useDismiss<T extends HTMLElement = HTMLDivElement>(
  open: boolean,
  onClose: () => void,
) {
  const ref = useRef<T>(null);

  // Held in a ref so an inline arrow from the caller does not tear the
  // listeners down and rebuild them on every render. Updated in an effect
  // rather than during render, which is the rule React enforces.
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

    // `pointerdown` rather than `click`: a menu that lingers until mouseup
    // feels stuck, and this fires for touch and pen too.
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return ref;
}
