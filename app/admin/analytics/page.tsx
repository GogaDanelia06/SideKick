import {
  IconBuildingStore,
  IconMessages,
  IconRobot,
  IconShoppingCart,
  IconUserPlus,
  IconUsers,
  IconPlugConnected,
  IconPackage,
} from "@tabler/icons-react";
import { getPlatformStats } from "@/lib/admin/analytics";
import { getTrafficReport } from "@/lib/analytics/report";
import { AdminHeading } from "@/components/admin/ui/AdminHeading";
import { LiveRefresh } from "@/components/admin/ui/LiveRefresh";
import { BiText } from "@/components/admin/ui/BiText";
import { DailyBars } from "@/components/admin/analytics/DailyBars";
import { Funnel } from "@/components/admin/analytics/Funnel";
import { RankedList } from "@/components/admin/analytics/RankedList";
import type { Text } from "@/lib/i18n/messages";
import { phrase } from "@/lib/i18n/messages";

export const dynamic = "force-dynamic";

const fmt = (n: number) => n.toLocaleString("en-US");

function Card({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof IconUsers;
  label: Text;
  value: string;
  sub?: Text;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-[10px] bg-blue-surface text-blue">
          <Icon size={18} />
        </span>
        <BiText className="text-[13px] text-muted" value={label} />
      </div>
      <div className="font-mono text-[28px] font-medium leading-none">{value}</div>
      {sub ? <BiText as="div" className="mt-1.5 text-[12px] text-faint" value={sub} /> : null}
    </div>
  );
}

/** A figure inside the income block — no icon, so the numbers lead. */
function Figure({
  label,
  value,
  sub,
  strong,
}: {
  label: Text;
  value: string;
  sub?: Text;
  strong?: boolean;
}) {
  return (
    <div>
      <BiText className="text-[12px] text-muted" value={label} />
      <div
        className={`mt-1 font-mono font-medium leading-none ${
          strong ? "text-[32px] text-green" : "text-[24px]"
        }`}
      >
        {value}
      </div>
      {sub ? <BiText as="div" className="mt-1.5 text-[12px] text-faint" value={sub} /> : null}
    </div>
  );
}

function SubCount({ label, count, tone }: { label: Text; count: number; tone: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <BiText value={label} />
      <span className={`font-mono ${tone}`}>{count}</span>
    </span>
  );
}

export default async function AdminAnalyticsPage() {
  const [s, traffic] = await Promise.all([getPlatformStats(), getTrafficReport()]);
  const maxGrowth = Math.max(1, ...s.growth.map((g) => g.count));

  return (
    <>
      <AdminHeading
        title={"admin.analytics.platformAnalytics"}
        subtitle={"admin.analytics.subtitle"}
        aside={<LiveRefresh />}
      />

      <div className="mb-6 rounded-lg border border-green bg-green-surface/30 p-5">
        <BiText
          as="h2"
          className="mb-4 text-base font-semibold"
          value={"admin.analytics.ourIncome"}
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Figure
            label={"admin.analytics.monthlyRecurringMrr"}
            value={`${fmt(s.income.mrr)}₾`}
            sub={phrase("admin.analytics.subscriptionsActive", { count: fmt(s.subscriptions.active) })}
            strong
          />
          <Figure
            label={"admin.analytics.collectedThisMonth"}
            value={`${fmt(s.income.collectedThisMonth)}₾`}
          />
          <Figure
            label={"admin.analytics.collectedInTotal"}
            value={`${fmt(s.income.collectedTotal)}₾`}
          />
          <Figure
            label={"admin.analytics.paymentProblems"}
            value={fmt(s.income.failedThisMonth + s.income.pending)}
            sub={phrase("admin.analytics.paymentsFailedPending", { failed: s.income.failedThisMonth, pending: s.income.pending })}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-border2 pt-4 text-[12px] text-muted">
          <SubCount
            label={"admin.analytics.trial"}
            count={s.subscriptions.trial}
            tone="text-ink"
          />
          <SubCount
            label={"admin.analytics.active"}
            count={s.subscriptions.active}
            tone="text-green"
          />
          <SubCount
            label={"admin.analytics.pastDue"}
            count={s.subscriptions.pastDue}
            tone="text-amber"
          />
          <SubCount
            label={"admin.analytics.cancelled"}
            count={s.subscriptions.cancelled}
            tone="text-faint"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          icon={IconBuildingStore}
          label={"admin.analytics.businesses"}
          value={fmt(s.businesses.total)}
          sub={phrase("admin.analytics.businessesNewThisMonth", { count: s.businesses.newThisMonth })}
        />
        <Card icon={IconUsers} label={"admin.analytics.users"} value={fmt(s.users)} />
        <Card
          icon={IconMessages}
          label={"admin.analytics.conversations"}
          value={fmt(s.conversations.total)}
          sub={phrase("admin.analytics.conversationsActive", { count: fmt(s.conversations.active) })}
        />
        <Card
          icon={IconRobot}
          label={"admin.analytics.messages"}
          value={fmt(s.messages.total)}
          sub={phrase("admin.analytics.messagesFromAi", { share: s.messages.aiSharePct })}
        />
        <Card
          icon={IconShoppingCart}
          label={"admin.analytics.tenantsSales"}
          value={fmt(s.tenantSales.orders)}
          sub={phrase("admin.analytics.tenantsTurnover", { total: fmt(s.tenantSales.total) })}
        />
        <Card
          icon={IconUserPlus}
          label={"admin.analytics.leads"}
          value={fmt(s.leads.total)}
          sub={phrase("admin.analytics.leadsClosed", { count: fmt(s.leads.converted) })}
        />
        <Card
          icon={IconPlugConnected}
          label={"admin.analytics.connectedChannels"}
          value={fmt(s.channelsConnected)}
        />
        <Card icon={IconPackage} label={"admin.analytics.products"} value={fmt(s.products)} />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        <BiText
          as="h2"
          className="mb-1 text-base font-semibold"
          value={"admin.analytics.planDistribution"}
        />
        <BiText
          as="p"
          className="mb-4 text-[12px] text-faint"
          value={"admin.analytics.everySubscriptionTrialsIncluded"}
        />
        <div className="flex flex-col gap-3">
          {s.plans.map((p) => {
            const total = s.plans.reduce((sum, x) => sum + x.subscribers, 0);
            const pct = total > 0 ? Math.round((p.subscribers / total) * 100) : 0;
            return (
              <div key={p.key}>
                <div className="mb-1 flex items-baseline justify-between text-[13px]">
                  <span className="font-medium">
                    {p.name} <span className="text-faint">· {p.price}₾</span>
                  </span>
                  <span className="text-muted">
                    {p.subscribers} ({pct}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-soft">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        <BiText
          as="h2"
          className="mb-4 text-base font-semibold"
          value={"admin.analytics.newBusinesses6Months"}
        />
        <div className="flex h-[140px] items-end gap-3">
          {s.growth.map((g) => (
            <div key={g.month} className="flex flex-1 flex-col items-center gap-2">
              <span className="font-mono text-[12px] text-muted">{g.count}</span>
              <div
                className="w-full rounded-t-[4px] bg-primary"
                style={{ height: `${Math.max(4, (g.count / maxGrowth) * 100)}%` }}
              />
              <span className="text-[11px] text-faint">{g.month.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        <BiText
          as="h2"
          className="mb-1 text-base font-semibold"
          value={"admin.analytics.visitsAndActions"}
        />
        <BiText
          as="p"
          className="mb-4 text-[12px] text-faint"
          value={"admin.analytics.last30Days"}
        />

        {traffic.empty ? (
          <BiText
            as="p"
            className="py-6 text-center text-sm text-muted"
            value={"admin.analytics.nothingRecordedYetFigures"}
          />
        ) : (
          <>
            <div className="mb-1 flex items-baseline gap-2">
              <span className="font-mono text-[26px] font-medium leading-none">
                {fmt(traffic.totalViews)}
              </span>
              <BiText
                className="text-[12px] text-muted"
                value={"admin.analytics.pageViews"}
              />
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
                title={"admin.analytics.actions"}
                rows={traffic.events.map(({ event, last30, last7 }) => ({
                  key: event.name,
                  label: event.label,
                  value: last30,
                  aside: phrase("admin.analytics.overSevenDays", { value: fmt(last7) }),
                }))}
              />

              <div className="flex flex-col gap-5">
                <RankedList
                  title={"admin.analytics.publicPages"}
                  rows={traffic.publicPages.map((p) => ({
                    key: p.path,
                    label: p.path,
                    value: p.views,
                  }))}
                />
                <RankedList
                  title={"admin.analytics.insideTheApp"}
                  rows={traffic.appPages.map((p) => ({
                    key: p.path,
                    label: p.path,
                    value: p.views,
                  }))}
                  note={"admin.analytics.note"}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
