import { IconAlertTriangle, IconArrowDown, IconCheck } from "@tabler/icons-react";
import { BiText } from "@/components/admin/ui/BiText";
import type { Bilingual } from "@/lib/content/types";

export type Step = {
  event: { name: string; label: Bilingual };
  count: number;
  /** Share of the step above, or null on the first one. */
  ofPrevious: number | null;
};

const fmt = (n: number) => n.toLocaleString("en-US");

/** Half of the previous step is the line between "normal drop-off" and "a problem". */
const HEALTHY_PCT = 50;

/** Signup funnel: bars sized to the first step, percentages in words, and status as icon plus label. */
export function Funnel({ steps }: { steps: Step[] }) {
  if (steps.length === 0) return null;

  const top = Math.max(1, steps[0].count);

  return (
    <div className="rounded-[8px] border border-border2 bg-soft p-4">
      <BiText
        as="h3"
        className="mb-3 text-[13px] font-semibold"
        value={{ ka: "რეგისტრაციის გზა", en: "Sign-up funnel" }}
      />

      <div className="flex flex-col gap-3">
        {steps.map((step, i) => {
          const ofTop = Math.round((step.count / top) * 100);
          const healthy = step.ofPrevious === null || step.ofPrevious >= HEALTHY_PCT;
          const Icon = step.ofPrevious === null ? null : healthy ? IconCheck : IconAlertTriangle;

          return (
            <div key={step.event.name}>
              <div className="mb-1 flex items-baseline gap-2.5 text-[13px]">
                <span className="w-[56px] shrink-0 font-mono text-[15px] tabular-nums">
                  {fmt(step.count)}
                </span>
                <BiText className="flex-1 text-ink" value={step.event.label} />

                {step.ofPrevious === null ? (
                  <BiText
                    className="text-[11px] text-faint"
                    value={{ ka: "საწყისი", en: "starting point" }}
                  />
                ) : (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] ${
                      healthy ? "text-green" : "text-amber"
                    }`}
                  >
                    {Icon ? <Icon size={13} /> : null}
                    {/* "Of start" appears only when it differs from "of previous". */}
                    <span className="font-mono tabular-nums">{step.ofPrevious}%</span>
                    {ofTop !== step.ofPrevious ? (
                      <>
                        <span className="text-faint">·</span>
                        <span className="font-mono tabular-nums text-faint">{ofTop}%</span>
                        <BiText
                          className="text-faint"
                          value={{ ka: "საწყისიდან", en: "of start" }}
                        />
                      </>
                    ) : null}
                  </span>
                )}
              </div>

              <div className="ml-[66px] h-2 overflow-hidden rounded-full bg-canvas">
                <div
                  className="h-full rounded-full bg-blue/70"
                  style={{ width: `${Math.max(1, ofTop)}%` }}
                />
              </div>

              {i < steps.length - 1 ? (
                <IconArrowDown size={13} className="ml-[66px] mt-1 text-faint" aria-hidden />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
