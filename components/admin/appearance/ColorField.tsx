"use client";

import { useState } from "react";
import { IconRotate2 } from "@tabler/icons-react";
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
  saved,
  onChange,
  onRevert,
}: {
  token: ThemeToken;
  value: string;
  /** The value on the server, so an edit can be undone one field at a time. */
  saved: string;
  onChange: (hex: string) => void;
  onRevert: () => void;
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

  const changed = value !== saved;

  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg border bg-card p-2.5 ${
        changed ? "border-blue" : "border-border"
      }`}
    >
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={t(token.label)}
        className="size-9 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0"
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 truncate text-[13px] font-medium">
          {t(token.label)}
          {/* Named, not just outlined — the blue border alone would leave someone
              who cannot see it wondering which fields they had touched. */}
          {changed ? (
            <button
              type="button"
              onClick={onRevert}
              title={t({ ka: "დაბრუნება", en: "Undo this change" })}
              className="inline-flex items-center gap-0.5 rounded-full bg-blue-surface px-1.5 text-[10px] font-medium text-blue"
            >
              <IconRotate2 size={11} />
              {t({ ka: "შეცვლილი", en: "changed" })}
            </button>
          ) : null}
        </span>
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
