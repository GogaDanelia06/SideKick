"use client";

import { useState, useTransition } from "react";
import type { Theme } from "@/lib/site/theme/css";
import { presetColors, type Preset } from "@/lib/site/theme/presets";
import { GROUPS, TOKENS, type Shade } from "@/lib/site/theme/tokens";
import { updateTheme } from "@/lib/admin/actions/theme";
import { useTheme } from "@/lib/theme/useTheme";
import { ColorRow } from "./ColorRow";
import { ContrastNotes } from "./ContrastNotes";
import { SHADES } from "./shades";
import { ThemeActions } from "./ThemeActions";
import { ThemeSection } from "./ThemeSection";
import { ThemeToolbar } from "./ThemeToolbar";
import { useLeaveWarning, useLiveTheme } from "./useLiveTheme";

function countChanges(draft: Theme, saved: Theme): number {
  return SHADES.reduce((n, s) => n + TOKENS.filter((t) => draft[s][t.id] !== saved[s][t.id]).length, 0);
}

/** Both themes' colours side by side; the page itself shows the result as you edit. */
export function ThemeEditor({ initial }: { initial: Theme }) {
  // Opens on the theme the admin is already looking at.
  const { theme: opened } = useTheme();
  const [chosen, setChosen] = useState<Shade | null>(null);
  const shade = chosen ?? opened;

  const [draft, setDraft] = useState<Theme>(initial);
  const [saved, setSaved] = useState<Theme>(initial);
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "failed">("idle");
  const changed = countChanges(draft, saved);

  useLiveTheme(draft, chosen);
  useLeaveWarning(changed > 0);

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
    <form action={save} className="flex flex-col gap-5">
      <input type="hidden" name="theme" value={JSON.stringify(draft)} />

      <ThemeToolbar shade={shade} onShade={setChosen} onPreset={applyPreset} />

      <div className="grid gap-5 xl:grid-cols-2">
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
                  onChange={(s, hex) => setColor(s, token.id, hex)}
                  onShade={setChosen}
                />
              ))}
            </ThemeSection>
          );
        })}
      </div>

      <ThemeActions pending={pending} status={status} changed={changed} onDiscard={() => setDraft(saved)}>
        <ContrastNotes theme={draft} />
      </ThemeActions>
    </form>
  );
}
