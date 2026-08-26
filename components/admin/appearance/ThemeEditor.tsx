"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { themeCss, type Theme } from "@/lib/site/theme/css";
import { GROUPS, TOKENS, defaultColors, type Shade } from "@/lib/site/theme/tokens";
import { updateTheme } from "@/lib/admin/actions";
import { ColorField } from "./ColorField";
import { ContrastNotes } from "./ContrastNotes";
import { ThemeActions } from "./ThemeActions";
import { ThemePreview } from "./ThemePreview";
import { ThemeSection } from "./ThemeSection";
import { ThemeToolbar } from "./ThemeToolbar";

function countChanges(draft: Theme, saved: Theme): number {
  return (["dark", "light"] as const).reduce(
    (n, s) => n + TOKENS.filter((t) => draft[s][t.id] !== saved[s][t.id]).length,
    0,
  );
}

export function ThemeEditor({ initial, shade: opened }: { initial: Theme; shade: Shade }) {
  const [shade, setShade] = useState<Shade>(opened);
  const [draft, setDraft] = useState<Theme>(initial);
  const [saved, setSaved] = useState<Theme>(initial);
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "failed">("idle");
  const entered = useRef(opened);
  const changed = countChanges(draft, saved);

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

  // Unsaved colours look saved: the whole panel is already wearing them. Without
  // this, closing the tab silently throws the work away.
  useEffect(() => {
    if (changed === 0) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [changed]);

  const colors = draft[shade];
  const patch = (next: Record<string, string>) =>
    setDraft((d) => ({ ...d, [shade]: { ...d[shade], ...next } }));

  function save(fd: FormData) {
    setStatus("idle");
    start(async () => {
      const res = await updateTheme(fd);
      if (!res.ok) return setStatus("failed");
      setSaved(draft);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    });
  }

  return (
    <form action={save} className="flex flex-col gap-5 xl:flex-row xl:items-start">
      <input type="hidden" name="theme" value={JSON.stringify(draft)} />

      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <ThemeToolbar shade={shade} onShade={setShade} onPreset={patch} />

        {GROUPS.map((g) => {
          const tokens = TOKENS.filter((x) => x.group === g.id);
          return (
            <ThemeSection
              key={g.id}
              group={g.id}
              title={g.label}
              hint={g.hint}
              count={tokens.length}
            >
              {tokens.map((token) => (
                <ColorField
                  key={token.id}
                  token={token}
                  value={colors[token.id]}
                  saved={saved[shade][token.id]}
                  onChange={(hex) => patch({ [token.id]: hex })}
                  onRevert={() => patch({ [token.id]: saved[shade][token.id] })}
                />
              ))}
            </ThemeSection>
          );
        })}
      </div>

      <aside className="flex w-full shrink-0 flex-col gap-3 xl:sticky xl:top-4 xl:w-[320px]">
        <ThemePreview colors={colors} />
        <ContrastNotes colors={colors} />
        <ThemeActions
          pending={pending}
          status={status}
          changed={changed}
          onDiscard={() => setDraft(saved)}
          onReset={() => patch(defaultColors(shade))}
        />
      </aside>
    </form>
  );
}
