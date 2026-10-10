"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { StatSourceOption } from "@/lib/site/statFormat";
import { AutoFields } from "./AutoFields";
import { INPUT, MODES, type Fields, type Mode } from "./statForm";

export function StatFields({ initial, sources }: { initial?: Fields; sources: StatSourceOption[] }) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>(initial?.mode ?? "MANUAL");
  const [source, setSource] = useState(initial?.source ?? sources[0]?.key ?? "");
  const picked = sources.find((s) => s.key === source);
  const active = MODES.find((m) => m.key === mode);

  return (
    <div className="grid gap-3">
      <div className="grid gap-2.5 sm:grid-cols-2">
        <input
          name="labelKa"
          required
          defaultValue={initial?.labelKa}
          placeholder={t("admin.stats.editor.labelKa")}
          className={INPUT}
        />
        <input
          name="labelEn"
          required
          defaultValue={initial?.labelEn}
          placeholder={t("admin.stats.editor.labelEn")}
          className={INPUT}
        />
      </div>

      <input type="hidden" name="mode" value={mode} />
      <div className="flex flex-wrap gap-1.5">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key)}
            className={`h-8 rounded-[8px] border px-3 text-[12px] font-medium transition-colors ${
              mode === m.key
                ? "border-blue bg-blue-surface text-blue"
                : "border-border text-muted hover:text-ink"
            }`}
          >
            {t(m.label)}
          </button>
        ))}
      </div>
      {active ? <p className="text-[12px] text-muted">{t(active.hint)}</p> : null}

      {mode === "MANUAL" ? (
        <div className="grid gap-2.5 sm:grid-cols-[1fr_120px]">
          <input
            name="value"
            required
            defaultValue={initial?.value}
            placeholder={t("admin.stats.editor.figureEG1")}
            className={INPUT}
          />
          <input
            name="suffix"
            defaultValue={initial?.suffix}
            placeholder={t("admin.stats.editor.suffix")}
            className={INPUT}
          />
        </div>
      ) : null}

      {mode === "LIVE" ? (
        <>
          <select
            name="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className={INPUT}
          >
            {sources.map((s) => (
              <option key={s.key} value={s.key}>
                {t(s.label)} — {s.value}
              </option>
            ))}
          </select>
          <p className="text-[12px] text-green">
            {t("admin.stats.editor.rightNow", { value: picked?.value ?? "—" })}
          </p>
        </>
      ) : null}

      {mode === "AUTO" ? <AutoFields initial={initial} /> : null}
    </div>
  );
}
