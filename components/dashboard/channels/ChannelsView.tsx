"use client";

import { useState } from "react";
import type { ChannelSummary } from "@/lib/dashboard/queries";
import type { ChannelAccounts } from "@/lib/channels/channelAccounts";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconWorld,
} from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { ChannelAccount } from "./ChannelAccount";
import { ChannelActions } from "./ChannelActions";
import { ConnectButton } from "./ConnectButton";
import { ConnectResult } from "./ConnectResult";
import { ChannelStatus } from "./ChannelStatus";
import { useLanguage } from "@/lib/i18n/useLanguage";

const META = {
  FACEBOOK: { name: "dashboard.channels.view.facebook", Icon: IconBrandFacebook, color: "#1877f2" },
  INSTAGRAM: { name: "dashboard.channels.view.instagram", Icon: IconBrandInstagram, color: "#c13584" },
  WHATSAPP: { name: "dashboard.channels.view.whatsapp", Icon: IconBrandWhatsapp, color: "#25d366" },
  WEBSITE: { name: "dashboard.channels.view.websiteApi", Icon: IconWorld, color: "var(--blue)" },
} as const;

export function ChannelsView({
  channels,
  accounts,
}: {
  channels: ChannelSummary[];
  accounts: Promise<ChannelAccounts>;
}) {
  const { t } = useLanguage();
  const [refusal, setRefusal] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-3">
      {refusal ? <p className="text-[13px] text-red">{refusal}</p> : null}

      {channels.map((c) => {
        const m = META[c.type];
        return (
          <Panel key={c.id} className="flex flex-wrap items-center gap-4 p-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-[10px] bg-soft" style={{ color: m.color }}>
              <m.Icon size={24} />
            </span>
            <div className="min-w-40 flex-1">
              <div className="font-semibold">{t(m.name)}</div>
              <div className="text-xs text-muted">
                {t("dashboard.channels.view.lastSync")}: {c.lastSyncAt ? new Date(c.lastSyncAt).toISOString().slice(0, 10) : "—"}
              </div>
              {c.linked ? <ChannelAccount accounts={accounts} id={c.id} /> : null}
            </div>
            <ChannelStatus connected={c.connected} linked={c.linked} />
            {c.linked ? <ChannelActions channel={c} name={m.name} onRefusal={setRefusal} /> : <ConnectButton type={c.type} />}

            <ConnectResult type={c.type} />
          </Panel>
        );
      })}
    </div>
  );
}
