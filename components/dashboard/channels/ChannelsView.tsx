"use client";

import { useTransition } from "react";
import type { Channel } from "@prisma/client";
import { IconBrandFacebook, IconBrandInstagram, IconBrandWhatsapp, IconBrandYoutube, IconWorld } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { setChannelConnected } from "@/lib/dashboard/actions";
import { useLanguage } from "@/lib/i18n/useLanguage";

const META = {
  FACEBOOK: { name: "Facebook", Icon: IconBrandFacebook, color: "#1877f2" },
  INSTAGRAM: { name: "Instagram", Icon: IconBrandInstagram, color: "#c13584" },
  WHATSAPP: { name: "WhatsApp", Icon: IconBrandWhatsapp, color: "#25d366" },
  WEBSITE: { name: "API for websites", Icon: IconWorld, color: "var(--blue)" },
} as const;

export function ChannelsView({ channels }: { channels: Channel[] }) {
  const { t } = useLanguage();
  const [pending, start] = useTransition();

  return (
    <div className="grid gap-3">
      <p className="text-sm text-blue">
        / {t({ ka: "თითო არხისთვის იხილეთ ვიდეო ინსტრუქცია მისაერთებლად.", en: "See the video guide to connect each channel." })}
      </p>
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
                {t({ ka: "ბოლო სინქრონიზაცია", en: "Last sync" })}: {c.lastSyncAt ? new Date(c.lastSyncAt).toISOString().slice(0, 10) : "—"}
              </div>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${c.connected ? "bg-green-surface text-green" : "bg-soft text-muted"}`}>
              {c.connected ? t({ ka: "დაკავშირებულია", en: "Connected" }) : t({ ka: "გათიშულია", en: "Disconnected" })}
            </span>
            <button
              type="button"
              disabled={pending}
              onClick={() => start(() => setChannelConnected(c.id, !c.connected))}
              className={`h-9 rounded-[8px] px-4 text-sm font-medium disabled:opacity-60 ${c.connected ? "border border-border text-red" : "bg-primary text-white"}`}
            >
              {c.connected ? t({ ka: "გათიშვა", en: "Disconnect" }) : t({ ka: "დაკავშირება", en: "Connect" })}
            </button>
            <a href="#" aria-label={t({ ka: "ვიდეო ინსტრუქცია", en: "Video guide" })} className="grid size-9 shrink-0 place-items-center rounded-[8px] border border-border bg-surface text-red">
              <IconBrandYoutube size={18} />
            </a>
          </Panel>
        );
      })}
    </div>
  );
}
