import { BiText } from "@/components/admin/ui/BiText";

/** One value per day, so the mark is a bar rather than a line. */
export type Day = { day: string; views: number };

const fmt = (n: number) => n.toLocaleString("en-US");

/** Ticks every fifth day. A label under all thirty bars is unreadable at this width. */
const TICK_EVERY = 5;

const shortDay = (iso: string) => iso.slice(5).replace("-", "/");

/**
 * Daily traffic for the last thirty days.
 *
 * The previous version was thirty bars and two dates — the first and the last.
 * You could see that something happened without being able to say what, or when,
 * or whether it was a lot: no scale to measure a bar against, and nothing but the
 * ends to date it by.
 *
 * So the chart now carries the three things that make a bar readable: the peak is
 * labelled where it stands, the average is drawn across as a reference, and the
 * dates appear often enough to place any bar within a day or two. One series, one
 * hue, no legend — the heading names it.
 */
export function DailyBars({ days }: { days: Day[] }) {
  const peak = Math.max(1, ...days.map((d) => d.views));
  const total = days.reduce((sum, d) => sum + d.views, 0);
  const average = days.length > 0 ? Math.round(total / days.length) : 0;
  const peakDay = days.find((d) => d.views === peak);

  return (
    <figure className="m-0">
      <div className="mb-1.5 flex items-baseline justify-between text-[11px] text-faint">
        <span className="font-mono tabular-nums">{fmt(peak)}</span>
        <BiText value={{ ka: "დღიური მაქსიმუმი", en: "busiest day" }} />
      </div>

      <div className="relative h-[128px]">
        {/* The average, drawn rather than stated: a bar is only "high" or "low"
            against something, and this is the something. */}
        {average > 0 ? (
          <div
            className="absolute inset-x-0 z-[1] border-t border-dashed border-border"
            style={{ bottom: `${(average / peak) * 100}%` }}
          >
            <span className="absolute -top-[7px] right-0 bg-card px-1 font-mono text-[10px] tabular-nums text-faint">
              {fmt(average)}
            </span>
          </div>
        ) : null}

        <div className="flex h-full items-end gap-[2px]">
          {days.map((d) => {
            const isPeak = d.day === peakDay?.day;
            return (
              <div
                key={d.day}
                title={`${d.day} — ${fmt(d.views)}`}
                aria-label={`${d.day}: ${fmt(d.views)}`}
                className={`flex-1 rounded-t-[4px] transition-opacity hover:opacity-60 ${
                  isPeak ? "bg-blue" : "bg-blue/55"
                }`}
                // A floor of 2px so a day with no traffic is still a day on the
                // axis rather than a gap in it.
                style={{ height: `${Math.max(2, (d.views / peak) * 100)}%` }}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-1.5 flex text-[10px] text-faint">
        {days.map((d, i) => (
          <span key={d.day} className="flex-1 text-center font-mono tabular-nums">
            {i % TICK_EVERY === 0 ? shortDay(d.day) : " "}
          </span>
        ))}
      </div>
    </figure>
  );
}
