"use client";

import { useState } from "react";
import { isHex } from "@/lib/site/theme/derive";
import type { ThemeToken } from "@/lib/site/theme/tokens";
import { useLanguage } from "@/lib/i18n/useLanguage";

/**
 * One colour, two ways in: the swatch for picking and the hex for pasting.
 *
 * The text box keeps its own draft while it is being typed. Feeding every
 * keystroke straight up would mean `#1f` is not a colour, so the parent would
 * reject it and re-render the old value on top of what is being typed — the
 * field would fight back after the second character. It only reports upward once
 * six digits are there.
 */
export function ColorField({
  token,
  value,
  onChange,
}: {
  token: ThemeToken;
  value: string;
  onChange: (hex: string) => void;
}) {
  const { t } = useLanguage();
  const [text, setText] = useState(value);
  const [lastSeen, setLastSeen] = useState(value);

  // Adjusting state during render, not in an effect: when the swatch or a preset
  // changes the colour from outside, the text box has to follow, and doing that
  // in an effect would paint the stale value for a frame first.
  if (value !== lastSeen) {
    setLastSeen(value);
    setText(value);
  }

  function typed(next: string) {
    const withHash = next.startsWith("#") ? next : `#${next}`;
    setText(withHash);
    if (isHex(withHash)) onChange(withHash.toLowerCase());
  }

  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-2.5">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={t(token.label)}
        className="size-9 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium">{t(token.label)}</span>
        <span className="block truncate text-[11px] text-muted">{t(token.hint)}</span>
      </span>
      <input
        value={text}
        onChange={(e) => typed(e.target.value)}
        onBlur={() => setText(value)}
        spellCheck={false}
        maxLength={7}
        aria-label={`${t(token.label)} hex`}
        className="w-[84px] shrink-0 rounded-[6px] border border-input bg-canvas px-2 py-1.5 font-mono text-[11px] outline-none focus:border-blue"
      />
    </div>
  );
}
