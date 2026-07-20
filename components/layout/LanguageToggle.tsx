"use client";

import { useState } from "react";
import clsx from "clsx";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import { LOCALES } from "@/lib/i18n/config";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const short = LOCALES.find((l) => l.code === locale)?.short ?? "GEO";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-[34px] items-center gap-1.5 rounded-sm border border-border px-[11px] text-[13px] font-medium text-ink"
      >
        {short}
        <IconChevronDown size={15} />
      </button>
      {open ? (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[70] cursor-default"
          />
          <div className="absolute right-0 top-[calc(100%+6px)] z-[80] min-w-[160px] rounded-md border border-border bg-card p-1.5 shadow-[0_10px_28px_rgba(0,0,0,0.28)]">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  setLocale(l.code);
                  setOpen(false);
                }}
                className={clsx(
                  "flex w-full items-center gap-2 rounded-sm px-[11px] py-2.5 text-left text-sm",
                  locale === l.code ? "font-semibold text-primary" : "text-ink",
                )}
              >
                {locale === l.code ? <IconCheck size={15} /> : <span className="size-[15px]" />}
                {l.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
