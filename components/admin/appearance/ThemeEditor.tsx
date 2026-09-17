"use client";

import { useMemo, useState, useTransition } from "react";
import { defaultTheme, type Theme } from "@/lib/site/theme/css";
import { presetColors, type Preset } from "@/lib/site/theme/presets";
import { GROUPS, TOKENS, type Shade } from "@/lib/site/theme/tokens";
import { updateTheme } from "@/lib/admin/actions/theme";
import { useTheme } from "@/lib/theme/useTheme";
import { ColorRow } from "./ColorRow";
import { ContrastNotes } from "./ContrastNotes";
import { PreviewFocus } from "./previewFocus";
import { SHADES } from "./shades";
import { ThemeActions } from "./ThemeActions";
import { ThemePreview } from "./ThemePreview";
import { ThemeSection } from "./ThemeSection";
import { ThemeToolbar } from "./ThemeToolbar";
import { useLeaveWarning, useLiveTheme } from "./useLiveTheme";

function countChanges(draft: Theme, saved: Theme): number {
  return SHADES.reduce((n, s) => n + TOKENS.filter((t) => draft[s][t.id] !== saved[s][t.id]).length, 0);
}

/** Both themes' colours side by side, with a live preview of the theme on screen. */
export function ThemeEditor({ initial }: { initial: Theme }) {
  // Opens on the theme the admin is already looking at.
  const { theme: opened } = useTheme();
  const [chosen, setChosen] = useState<Shade | null>(null);
  const shade = chosen ?? opened;

  const [draft, setDraft] = useState<Theme>(initial);
  const [saved, setSaved] = useState<Theme>(initial);
  const [active, setActive] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "failed">("idle");
  const changed = countChanges(draft, saved);

  useLiveTheme(draft, chosen);
  useLeaveWarning(changed > 0);

  const focus = useMemo(
    () => ({
      active,
      pick: (tokenId: string) => {
        setActive(tokenId);
        document.getElementById(`color-${tokenId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        // A click marks the row for a moment; pointing at rows takes over after that.
        window.setTimeout(() => setActive((current) => (current === tokenId ? null : current)), 2500);
      },
    }),
    [active],
  );

  const setColor = (s: Shade, tokenId: string, hex: string) =>
    setDraft((d) => ({ ...d, [s]: { ...d[s], [tokenId]: hex } }));

  const applyPreset = (preset: Preset) =>
    setDraft({ dark: presetColors(preset, "dark"), light: presetColors(preset, "light") });

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
    <PreviewFocus.Provider value={focus}>
      <form action={save} className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <input type="hidden" name="theme" value={JSON.stringify(draft)} />

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <ThemeToolbar shade={shade} onShade={setChosen} onPreset={applyPreset} />

          {GROUPS.map((g) => {
            const tokens = TOKENS.filter((x) => x.group === g.id);
            return (
              <ThemeSection key={g.id} group={g.id} title={g.label} hint={g.hint} count={tokens.length} shade={shade}>
                {tokens.map((token) => (
                  <ColorRow
                    key={token.id}
                    token={token}
                    draft={draft}
                    saved={saved}
                    active={active === token.id}
                    onPoint={setActive}
                    onChange={(s, hex) => setColor(s, token.id, hex)}
                    onShade={setChosen}
                  />
                ))}
              </ThemeSection>
            );
          })}
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-8rem)] lg:w-[340px] xl:w-[360px]">
          <ThemePreview colors={draft[shade]} shade={shade} />
          <ThemeActions
            pending={pending}
            status={status}
            changed={changed}
            onDiscard={() => setDraft(saved)}
            onReset={() => setDraft(defaultTheme())}
          >
            <ContrastNotes theme={draft} />
          </ThemeActions>
        </aside>
      </form>
    </PreviewFocus.Provider>
  );
}
