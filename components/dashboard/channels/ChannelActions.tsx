"use client";

import { useState, useTransition } from "react";
import type { ChannelSummary } from "@/lib/dashboard/queries";
import { useToast } from "@/components/dashboard/ui/Toast";
import { disconnectChannel, setChannelConnected } from "@/lib/dashboard/actions/channels";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";
import { ConnectButton } from "./ConnectButton";

const BTN = "h-9 rounded-[8px] px-4 text-sm font-medium disabled:opacity-60";

export function ChannelActions({
  channel,
  name,
  onRefusal,
}: {
  channel: ChannelSummary;
  name: Text;
  onRefusal: (message: string | null) => void;
}) {
  const { t } = useLanguage();
  const notify = useToast();
  const [pending, start] = useTransition();
  const [asking, setAsking] = useState(false);

  function toggle() {
    start(async () => {
      onRefusal(null);
      const res = await setChannelConnected(channel.id, !channel.connected);
      if (res.ok) {
        notify(t(channel.connected ? "dashboard.channels.view.turnedOffToast" : "dashboard.channels.view.connectedToast", { name: t(name) }));
      } else if (res.error === "limit") {
        onRefusal(t("dashboard.channels.view.planLimit", { plan: t(res.planName), limit: res.limit, used: res.used }));
      }
    });
  }

  function release() {
    start(async () => {
      onRefusal(null);
      const res = await disconnectChannel(channel.id);
      setAsking(false);
      if (res.ok) notify(t("dashboard.channels.view.disconnectedToast", { name: t(name) }));
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 max-sm:w-full">
        <ConnectButton type={channel.type} relink />
        <button
          type="button"
          disabled={pending}
          onClick={toggle}
          className={`${BTN} ${channel.connected ? "border border-border hover:bg-soft" : "bg-primary text-white"}`}
        >
          {t(channel.connected ? "dashboard.channels.view.turnOff" : "dashboard.channels.view.turnOn")}
        </button>
        {asking ? null : (
          <button type="button" disabled={pending} onClick={() => setAsking(true)} className={`${BTN} border border-border text-red hover:bg-soft`}>
            {t("dashboard.channels.view.disconnect")}
          </button>
        )}
      </div>

      {asking ? (
        <div className="flex w-full flex-wrap items-center gap-3 border-t border-border2 pt-3">
          <p className="min-w-0 flex-1 basis-60 text-[13px] text-muted">{t("dashboard.channels.view.disconnectAsk", { name: t(name) })}</p>
          <button type="button" disabled={pending} onClick={release} className={`${BTN} bg-red text-white`}>
            {t("dashboard.channels.view.disconnect")}
          </button>
          <button type="button" disabled={pending} onClick={() => setAsking(false)} className={`${BTN} text-muted hover:text-ink`}>
            {t("dashboard.channels.view.keep")}
          </button>
        </div>
      ) : null}
    </>
  );
}
