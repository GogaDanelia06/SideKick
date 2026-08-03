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
import type { Bilingual } from "@/lib/content/types";

// The figures are counted per request; nothing here may be cached between them.
export const dynamic = "force-dynamic";

const fmt = (n: number) => n.toLocaleString("en-US");

function Card({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof IconUsers;
  label: Bilingual;
  value: string;
  sub?: Bilingual;
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
  label: Bilingual;
  value: string;
  sub?: Bilingual;
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

function SubCount({ label, count, tone }: { label: Bilingual; count: number; tone: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <BiText value={label} />
      <span className={`font-mono ${tone}`}>{count}</span>
    </span>
  );
}

function PageList({
  title,
  pages,
  note,
}: {
  title: Bilingual;
  pages: { path: string; views: number }[];
  note?: Bilingual;
}) {
  return (
    <div>
      <BiText as="h3" className="mb-2 text-[13px] font-semibold" value={title} />
      {pages.length === 0 ? (
        <BiText
          as="p"
          className="py-2 text-[12px] text-faint"
          value={{ ka: "ჯერ არაფერი", en: "Nothing yet" }}
        />
      ) : (
        <div className="flex flex-col">
          {pages.map((p) => (
            <div
              key={p.path}
              className="flex items-baseline justify-between border-b border-border2 py-2 text-[13px] last:border-0"
            >
              <span className="truncate font-mono text-muted">{p.path}</span>
              <span className="font-mono">{p.views.toLocaleString("en-US")}</span>
            </div>
          ))}
        </div>
      )}
      {note ? <BiText as="p" className="mt-1.5 text-[11px] text-faint" value={note} /> : null}
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  const [s, traffic] = await Promise.all([getPlatformStats(), getTrafficReport()]);
  const maxGrowth = Math.max(1, ...s.growth.map((g) => g.count));
  const maxDaily = Math.max(1, ...traffic.daily.map((d) => d.views));

  return (
    <>
      <AdminHeading
        title={{ ka: "პლატფორმის ანალიტიკა", en: "Platform analytics" }}
        subtitle={{
          ka: "ჯამური მაჩვენებლები ყველა კლიენტზე. მიმოწერების შიგთავსი აქ არ ჩანს — მხოლოდ რიცხვები.",
          en: "Aggregate figures across every tenant. No conversation content is shown here — numbers only.",
        }}
        aside={<LiveRefresh />}
      />

      {/* Income first — it is the platform owner's own money, and the reason
          the rest of the page matters. */}
      <div className="mb-6 rounded-lg border border-green bg-green-surface/30 p-5">
        <BiText
          as="h2"
          className="mb-4 text-base font-semibold"
          value={{ ka: "ჩვენი შემოსავალი", en: "Our income" }}
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Figure
            label={{ ka: "თვიური შემოსავალი (MRR)", en: "Monthly recurring (MRR)" }}
            value={`${fmt(s.income.mrr)}₾`}
            sub={{
              ka: `${s.subscriptions.active} აქტიური გამოწერა`,
              en: `${s.subscriptions.active} active subscriptions`,
            }}
            strong
          />
          <Figure
            label={{ ka: "ამ თვეში მიღებული", en: "Collected this month" }}
            value={`${fmt(s.income.collectedThisMonth)}₾`}
          />
          <Figure
            label={{ ka: "სულ მიღებული", en: "Collected in total" }}
            value={`${fmt(s.income.collectedTotal)}₾`}
          />
          <Figure
            label={{ ka: "პრობლემური გადახდები", en: "Payment problems" }}
            value={fmt(s.income.failedThisMonth + s.income.pending)}
            sub={{
              ka: `${s.income.failedThisMonth} ჩავარდნილი · ${s.income.pending} მიმდინარე`,
              en: `${s.income.failedThisMonth} failed · ${s.income.pending} pending`,
            }}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-border2 pt-4 text-[12px] text-muted">
          <SubCount
            label={{ ka: "საცდელი", en: "Trial" }}
            count={s.subscriptions.trial}
            tone="text-ink"
          />
          <SubCount
            label={{ ka: "აქტიური", en: "Active" }}
            count={s.subscriptions.active}
            tone="text-green"
          />
          <SubCount
            label={{ ka: "ვადაგადაცილებული", en: "Past due" }}
            count={s.subscriptions.pastDue}
            tone="text-amber"
          />
          <SubCount
            label={{ ka: "გაუქმებული", en: "Cancelled" }}
            count={s.subscriptions.cancelled}
            tone="text-faint"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          icon={IconBuildingStore}
          label={{ ka: "ბიზნესი", en: "Businesses" }}
          value={fmt(s.businesses.total)}
          sub={{
            ka: `+${s.businesses.newThisMonth} ამ თვეში`,
            en: `+${s.businesses.newThisMonth} this month`,
          }}
        />
        <Card icon={IconUsers} label={{ ka: "მომხმარებელი", en: "Users" }} value={fmt(s.users)} />
        <Card
          icon={IconMessages}
          label={{ ka: "მიმოწერა", en: "Conversations" }}
          value={fmt(s.conversations.total)}
          sub={{
            ka: `${s.conversations.active} აქტიური`,
            en: `${s.conversations.active} active`,
          }}
        />
        <Card
          icon={IconRobot}
          label={{ ka: "შეტყობინება", en: "Messages" }}
          value={fmt(s.messages.total)}
          sub={{
            ka: `${s.messages.aiSharePct}% AI-სგან`,
            en: `${s.messages.aiSharePct}% from AI`,
          }}
        />
        <Card
          icon={IconShoppingCart}
          label={{ ka: "კლიენტების გაყიდვები", en: "Tenants' sales" }}
          value={fmt(s.tenantSales.orders)}
          sub={{
            ka: `${fmt(s.tenantSales.total)}₾ — მათი ბრუნვა, არა ჩვენი`,
            en: `${fmt(s.tenantSales.total)}₾ — their turnover, not ours`,
          }}
        />
        <Card
          icon={IconUserPlus}
          label={{ ka: "ლიდი", en: "Leads" }}
          value={fmt(s.leads.total)}
          sub={{
            ka: `${s.leads.converted} დახურული`,
            en: `${s.leads.converted} closed`,
          }}
        />
        <Card
          icon={IconPlugConnected}
          label={{ ka: "მიერთებული არხი", en: "Connected channels" }}
          value={fmt(s.channelsConnected)}
        />
        <Card icon={IconPackage} label={{ ka: "პროდუქტი", en: "Products" }} value={fmt(s.products)} />
      </div>

      {/* Plan distribution */}
      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        <BiText
          as="h2"
          className="mb-1 text-base font-semibold"
          value={{ ka: "პაკეტების განაწილება", en: "Plan distribution" }}
        />
        {/* Counts every subscription, paying or not — the status split above is
            where you see who is actually on a paid plan. */}
        <BiText
          as="p"
          className="mb-4 text-[12px] text-faint"
          value={{
            ka: "ყველა გამოწერა, საცდელის ჩათვლით.",
            en: "Every subscription, trials included.",
          }}
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

      {/* Growth */}
      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        <BiText
          as="h2"
          className="mb-4 text-base font-semibold"
          value={{ ka: "ახალი ბიზნესები (6 თვე)", en: "New businesses (6 months)" }}
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

      {/* Traffic — the questions "how many people came" and "what did they do",
          answered from our own counters rather than from Google. */}
      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        <BiText
          as="h2"
          className="mb-1 text-base font-semibold"
          value={{ ka: "ვიზიტები და ქმედებები", en: "Visits and actions" }}
        />
        <BiText
          as="p"
          className="mb-4 text-[12px] text-faint"
          value={{ ka: "ბოლო 30 დღე.", en: "Last 30 days." }}
        />

        {traffic.empty ? (
          <BiText
            as="p"
            className="py-6 text-center text-sm text-muted"
            value={{
              ka: "ჯერ არაფერი დაფიქსირებულა — ციფრები პირველი ვიზიტებიდან გაჩნდება.",
              en: "Nothing recorded yet — figures appear once visitors arrive.",
            }}
          />
        ) : (
          <>
            <div className="mb-1 flex items-baseline gap-2">
              <span className="font-mono text-[26px] font-medium leading-none">
                {fmt(traffic.totalViews)}
              </span>
              <BiText
                className="text-[12px] text-muted"
                value={{ ka: "გვერდის ნახვა", en: "page views" }}
              />
            </div>
            <div className="mb-6 flex h-[110px] items-end gap-[3px]">
              {traffic.daily.map((d) => (
                <div
                  key={d.day}
                  title={`${d.day}: ${fmt(d.views)}`}
                  className="flex-1 rounded-t-[2px] bg-blue transition-opacity hover:opacity-70"
                  style={{ height: `${Math.max(2, (d.views / maxDaily) * 100)}%` }}
                />
              ))}
            </div>
            <div className="mb-6 flex justify-between text-[11px] text-faint">
              <span>{traffic.daily[0]?.day}</span>
              <span>{traffic.daily.at(-1)?.day}</span>
            </div>

            {/* The funnel is the one thing here that answers "is the site
                working" rather than "how busy was it". */}
            {traffic.funnel.length > 0 ? (
              <div className="mb-6 rounded-[8px] border border-border2 bg-soft p-4">
                <BiText
                  as="h3"
                  className="mb-3 text-[13px] font-semibold"
                  value={{ ka: "რეგისტრაციის გზა", en: "Sign-up funnel" }}
                />
                <div className="flex flex-col gap-2">
                  {traffic.funnel.map((step) => (
                    <div key={step.event.name} className="flex items-baseline gap-3 text-[13px]">
                      <span className="w-[52px] shrink-0 font-mono text-[15px]">
                        {fmt(step.count)}
                      </span>
                      <BiText className="flex-1 text-muted" value={step.event.label} />
                      {step.ofPrevious !== null ? (
                        <span
                          className={`font-mono text-[12px] ${
                            step.ofPrevious >= 50 ? "text-green" : "text-amber"
                          }`}
                        >
                          {step.ofPrevious}%
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <BiText
                  as="h3"
                  className="mb-2 text-[13px] font-semibold"
                  value={{ ka: "ქმედებები", en: "Actions" }}
                />
                <div className="flex flex-col">
                  {traffic.events.map(({ event, last30, last7 }) => (
                    <div
                      key={event.name}
                      className="flex items-baseline justify-between border-b border-border2 py-2 text-[13px] last:border-0"
                    >
                      <BiText className="text-muted" value={event.label} />
                      <span className="flex items-baseline gap-3">
                        <span className="font-mono">{fmt(last30)}</span>
                        <span className="w-[64px] text-right text-[11px] text-faint">
                          {fmt(last7)} / 7დღე
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <PageList
                  title={{ ka: "საიტის გვერდები", en: "Public pages" }}
                  pages={traffic.publicPages}
                />
                <PageList
                  title={{ ka: "აპლიკაციაში", en: "Inside the app" }}
                  pages={traffic.appPages}
                  note={{
                    ka: "ავტორიზებული მომხმარებლების ეკრანები — მარკეტინგულ ციფრს არ ერევა.",
                    en: "Signed-in screens — kept out of the marketing figures.",
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <p className="mt-4 text-[12px] text-faint">
        <BiText
          value={{
            ka: "შენიშვნა: კლიენტების მიმოწერების შიგთავსზე წვდომა შეგნებულად არ არის — ის მათი მომხმარებლების პერსონალური მონაცემია.",
            en: "Note: access to tenants' conversation content is deliberately excluded — it is their customers' personal data.",
          }}
        />
      </p>
    </>
  );
}
