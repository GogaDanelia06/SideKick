import { BiText } from "@/components/admin/ui/BiText";
import { phrase } from "@/lib/i18n/messages";
import type { TrafficReport } from "@/lib/analytics/report";
import { DailyBars } from "./DailyBars";
import { fmt } from "./format";
import { Funnel } from "./Funnel";
import { RankedList } from "./RankedList";

export function TrafficPanel({ traffic }: { traffic: TrafficReport }) {
  return (
    <div className="mt-6 rounded-lg border border-border bg-card p-5">
      <BiText as="h2" className="mb-1 text-base font-semibold" value="admin.analytics.visitsAndActions" />
      <BiText as="p" className="mb-4 text-[12px] text-faint" value="admin.analytics.last30Days" />

      {traffic.empty ? (
        <BiText
          as="p"
          className="py-6 text-center text-sm text-muted"
          value="admin.analytics.nothingRecordedYetFigures"
        />
      ) : (
        <>
          <div className="mb-1 flex items-baseline gap-2">
            <span className="font-mono text-[26px] font-medium leading-none">{fmt(traffic.totalViews)}</span>
            <BiText className="text-[12px] text-muted" value="admin.analytics.pageViews" />
          </div>
          <div className="mb-6">
            <DailyBars days={traffic.daily} />
          </div>

          {traffic.funnel.length > 0 ? (
            <div className="mb-6">
              <Funnel steps={traffic.funnel} />
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2">
            <RankedList
              title="admin.analytics.actions"
              rows={traffic.events.map(({ event, last30, last7 }) => ({
                key: event.name,
                label: event.label,
                value: last30,
                aside: phrase("admin.analytics.overSevenDays", { value: fmt(last7) }),
              }))}
            />

            <div className="flex flex-col gap-5">
              <RankedList
                title="admin.analytics.publicPages"
                rows={traffic.publicPages.map((p) => ({ key: p.path, label: p.path, value: p.views }))}
              />
              <RankedList
                title="admin.analytics.insideTheApp"
                rows={traffic.appPages.map((p) => ({ key: p.path, label: p.path, value: p.views }))}
                note="admin.analytics.note"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
