"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { themeCss, type Theme } from "@/lib/site/theme/css";
import { GROUPS, TOKENS, defaultColors, type Shade } from "@/lib/site/theme/tokens";
import { updateTheme } from "@/lib/admin/actions";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { ColorField } from "./ColorField";
import { ContrastNotes } from "./ContrastNotes";
import { ThemePreview } from "./ThemePreview";
import { ThemeToolbar } from "./ThemeToolbar";

export function ThemeEditor({ initial, shade: opened }: { initial: Theme; shade: Shade }) {
  const { t } = useLanguage();
  const [shade, setShade] = useState<Shade>(opened);
  const [draft, setDraft] = useState<Theme>(initial);
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "failed">("idle");
  const entered = useRef(opened);

  // The draft, applied to the real page. This panel is one of the surfaces being
  // edited, so the preview is the thing itself rather than a picture of it.
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "theme-preview";
    style.textContent = themeCss(draft);
    document.head.append(style);
    return () => style.remove();
  }, [draft]);

  // Editing the light palette while looking at the dark one is guesswork, so the
  // tab switches what is on screen too. Restored on the way out — the choice
  // belongs to the theme toggle, not to this page.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", shade);
  }, [shade]);
  useEffect(() => {
    const original = entered.current;
    return () => document.documentElement.setAttribute("data-theme", original);
  }, []);

  const colors = draft[shade];
  const patch = (next: Record<string, string>) =>
    setDraft((d) => ({ ...d, [shade]: { ...d[shade], ...next } }));

  function save(fd: FormData) {
    setStatus("idle");
    start(async () => {
      const res = await updateTheme(fd);
      setStatus(res.ok ? "saved" : "failed");
      if (res.ok) setTimeout(() => setStatus("idle"), 2500);
    });
  }

  return (
    <form action={save} className="flex flex-col gap-5 xl:flex-row xl:items-start">
      <input type="hidden" name="theme" value={JSON.stringify(draft)} />

      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <ThemeToolbar shade={shade} onShade={setShade} onPreset={patch} />

        {GROUPS.map((g) => (
          <section key={g.id}>
            <h3 className="text-[13px] font-semibold">{t(g.label)}</h3>
            <p className="mb-2 text-[11px] text-muted">{t(g.hint)}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {TOKENS.filter((x) => x.group === g.id).map((token) => (
                <ColorField
                  key={token.id}
                  token={token}
                  value={colors[token.id]}
                  onChange={(hex) => patch({ [token.id]: hex })}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <aside className="flex w-full shrink-0 flex-col gap-3 xl:sticky xl:top-4 xl:w-[320px]">
        <ThemePreview colors={colors} />
        <ContrastNotes colors={colors} />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={pending}
            className="h-9 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas disabled:opacity-60"
          >
            {pending ? "…" : t({ ka: "შენახვა", en: "Save" })}
          </button>
          <button
            type="button"
            onClick={() => patch(defaultColors(shade))}
            className="h-9 rounded-[8px] border border-border px-3 text-[12px] text-muted hover:text-ink"
          >
            {t({ ka: "ნაგულისხმევზე დაბრუნება", en: "Reset" })}
          </button>
          {status === "saved" ? (
            <span className="text-[12px] text-green">{t({ ka: "შენახულია", en: "Saved" })}</span>
          ) : null}
          {status === "failed" ? (
            <span className="text-[12px] text-red">{t({ ka: "ვერ შეინახა", en: "Could not save" })}</span>
          ) : null}
        </div>
      </aside>
    </form>
  );
}
