"use client";

import { useState, useTransition } from "react";
// A subset of Channel, so the access token never reaches the browser.
import type { ChannelSummary } from "@/lib/dashboard/queries";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconWorld,
} from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { useToast } from "@/components/dashboard/ui/Toast";
import { ConnectButton, ConnectResult } from "./ConnectMeta";
import { ChannelStatus } from "./ChannelStatus";
import { setChannelConnected } from "@/lib/dashboard/actions/channels";
import { useLanguage } from "@/lib/i18n/useLanguage";

const META = {
  FACEBOOK: { name: "Facebook", Icon: IconBrandFacebook, color: "#1877f2" },
  INSTAGRAM: { name: "Instagram", Icon: IconBrandInstagram, color: "#c13584" },
  WHATSAPP: { name: "WhatsApp", Icon: IconBrandWhatsapp, color: "#25d366" },
  WEBSITE: { name: "dashboard.channels.view.websiteApi", Icon: IconWorld, color: "var(--blue)" },
} as const;

export function ChannelsView({ channels }: { channels: ChannelSummary[] }) {
  const { t } = useLanguage();
  const notify = useToast();
  const [pending, start] = useTransition();
  const [refusal, setRefusal] = useState<string | null>(null);

  return (
    <div className="grid gap-3">

      {refusal ? <p className="text-[13px] text-red">{refusal}</p> : null}

      {channels.map((c) => {
        const m = META[c.type];
        return (
          <Panel key={c.id} className="flex flex-wrap items-center gap-4 p-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-[10px] bg-soft" style={{ color: m.color }}>
              <m.Icon size={24} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{m.name}</div>
              <div className="text-xs text-muted">
                {t("dashboard.channels.view.lastSync")}: {c.lastSyncAt ? new Date(c.lastSyncAt).toISOString().slice(0, 10) : "—"}
              </div>
            </div>
            <ChannelStatus connected={c.connected} linked={c.linked} />
            {!c.linked ? (
              <ConnectButton type={c.type} />
            ) : (
              <>
              {/* Re-authorising stays available: tokens expire and grants can miss scopes. */}
              <ConnectButton type={c.type} relink />
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  setRefusal(null);
                  const res = await setChannelConnected(c.id, !c.connected);
                  if (res.ok) {
                    notify(t(c.connected ? "dashboard.channels.view.disconnectedToast" : "dashboard.channels.view.connectedToast", { name: m.name }));
                  }
                  if (!res.ok && res.error === "limit") {
                    setRefusal(
                      t("dashboard.channels.view.planLimit", {
                        plan: t(res.planName),
                        limit: res.limit,
                        used: res.used,
                      }),
                    );
                  }
                })
              }
              className={`h-9 rounded-[8px] px-4 text-sm font-medium disabled:opacity-60 ${c.connected ? "border border-border text-red" : "bg-primary text-white"}`}
            >
              {c.connected ? t("dashboard.channels.view.disconnect") : t("dashboard.channels.view.turnOn")}
            </button>
              </>
            )}

            <ConnectResult type={c.type} />

          </Panel>
        );
      })}
    </div>
  );
}
