"use client";

import { useState } from "react";
import { IconRotate2 } from "@tabler/icons-react";
import { isHex } from "@/lib/site/theme/derive";
import type { ThemeToken } from "@/lib/site/theme/tokens";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** A colour swatch plus a hex input; typed text is reported only once it is a full hex. */
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

  // Sync with outside changes during render, so a stale value is never painted.
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
      {/* An invisible native colour input over a painted swatch (the native control renders poorly). */}
      <span
        style={{ background: value }}
        className="relative size-9 shrink-0 overflow-hidden rounded-md border border-border focus-within:ring-2 focus-within:ring-blue-ring"
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={t(token.label)}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 truncate text-[13px] font-medium">
          {t(token.label)}
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
