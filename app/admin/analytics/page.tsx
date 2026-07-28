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
import { AdminHeading } from "@/components/admin/ui/AdminHeading";
import { BiText } from "@/components/admin/ui/BiText";
import type { Bilingual } from "@/lib/content/types";

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

export default async function AdminAnalyticsPage() {
  const s = await getPlatformStats();
  const maxGrowth = Math.max(1, ...s.growth.map((g) => g.count));

  return (
    <>
      <AdminHeading
        title={{ ka: "პლატფორმის ანალიტიკა", en: "Platform analytics" }}
        subtitle={{
          ka: "ჯამური მაჩვენებლები ყველა კლიენტზე. მიმოწერების შიგთავსი აქ არ ჩანს — მხოლოდ რიცხვები.",
          en: "Aggregate figures across every tenant. No conversation content is shown here — numbers only.",
        }}
      />

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
          label={{ ka: "შეკვეთა", en: "Orders" }}
          value={fmt(s.orders.total)}
          sub={{
            ka: `${fmt(s.orders.revenue)}₾ ბრუნვა`,
            en: `${fmt(s.orders.revenue)}₾ revenue`,
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
          className="mb-4 text-base font-semibold"
          value={{ ka: "პაკეტების განაწილება", en: "Plan distribution" }}
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
