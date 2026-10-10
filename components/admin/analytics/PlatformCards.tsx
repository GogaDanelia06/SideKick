import {
  IconBuildingStore,
  IconMessages,
  IconPackage,
  IconPlugConnected,
  IconRobot,
  IconShoppingCart,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";
import type { PlatformStats } from "@/lib/admin/analytics";
import { phrase } from "@/lib/i18n/messages";
import { fmt } from "./format";
import { StatCard } from "./StatCard";

export function PlatformCards({ stats: s }: { stats: PlatformStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={IconBuildingStore}
        label="admin.analytics.businesses"
        value={fmt(s.businesses.total)}
        sub={phrase("admin.analytics.businessesNewThisMonth", { count: s.businesses.newThisMonth })}
      />
      <StatCard icon={IconUsers} label="admin.analytics.users" value={fmt(s.users)} />
      <StatCard
        icon={IconMessages}
        label="admin.analytics.conversations"
        value={fmt(s.conversations.total)}
        sub={phrase("admin.analytics.conversationsActive", { count: fmt(s.conversations.active) })}
      />
      <StatCard
        icon={IconRobot}
        label="admin.analytics.messages"
        value={fmt(s.messages.total)}
        sub={phrase("admin.analytics.messagesFromAi", { share: s.messages.aiSharePct })}
      />
      <StatCard
        icon={IconShoppingCart}
        label="admin.analytics.tenantsSales"
        value={fmt(s.tenantSales.orders)}
        sub={phrase("admin.analytics.tenantsTurnover", { total: fmt(s.tenantSales.total) })}
      />
      <StatCard
        icon={IconUserPlus}
        label="admin.analytics.leads"
        value={fmt(s.leads.total)}
        sub={phrase("admin.analytics.leadsClosed", { count: fmt(s.leads.converted) })}
      />
      <StatCard icon={IconPlugConnected} label="admin.analytics.connectedChannels" value={fmt(s.channelsConnected)} />
      <StatCard icon={IconPackage} label="admin.analytics.products" value={fmt(s.products)} />
    </div>
  );
}
