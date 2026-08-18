"use client";

import { useState, useTransition } from "react";
// Not `Channel`: the page deliberately fetches a subset, so the access token
// never reaches this client component and therefore never reaches the browser.
import type { ChannelSummary } from "@/lib/dashboard/queries";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconWorld,
} from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { ConnectButton, ConnectResult } from "./ConnectMeta";
import { ChannelStatus } from "./ChannelStatus";
import { setChannelConnected } from "@/lib/dashboard/actions";
import { useLanguage } from "@/lib/i18n/useLanguage";

const META = {
  FACEBOOK: { name: "Facebook", Icon: IconBrandFacebook, color: "#1877f2" },
  INSTAGRAM: { name: "Instagram", Icon: IconBrandInstagram, color: "#c13584" },
  WHATSAPP: { name: "WhatsApp", Icon: IconBrandWhatsapp, color: "#25d366" },
  WEBSITE: { name: "API for websites", Icon: IconWorld, color: "var(--blue)" },
} as const;

export function ChannelsView({ channels }: { channels: ChannelSummary[] }) {
  const { t } = useLanguage();
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
                {t({ ka: "ბოლო სინქრონიზაცია", en: "Last sync" })}: {c.lastSyncAt ? new Date(c.lastSyncAt).toISOString().slice(0, 10) : "—"}
              </div>
            </div>
            <ChannelStatus connected={c.connected} linked={c.linked} />
            {!c.linked ? (
              // Never authorised, so there is nothing to switch on — the only
              // useful action is the grant itself.
              <ConnectButton type={c.type} />
            ) : (
              <>
              {/* Re-authorising has to stay reachable for a channel that is
                  already linked. Instagram tokens expire after sixty days, and
                  a credential can be granted with the wrong scopes — in both
                  cases the row looks perfectly connected while receiving
                  nothing, and the only repair is walking through consent again.
                  Hiding this behind "not linked yet" left no way to do that. */}
              <ConnectButton type={c.type} relink />
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  setRefusal(null);
                  const res = await setChannelConnected(c.id, !c.connected);
                  // The plan ceiling is the common case and it used to look
                  // like a dead button — say so where the click happened.
                  if (!res.ok && res.error === "limit") {
                    setRefusal(
                      t({
                        ka: `„${res.planName}" გეგმა ${res.limit} არხს უშვებს და ${res.used} უკვე ჩართულია. ჯერ სხვა გამორთე ან გეგმა შეცვალე.`,
                        en: `The "${res.planName}" plan allows ${res.limit} channel(s) and ${res.used} are already on. Turn one off first, or change the plan.`,
                      }),
                    );
                  }
                })
              }
              className={`h-9 rounded-[8px] px-4 text-sm font-medium disabled:opacity-60 ${c.connected ? "border border-border text-red" : "bg-primary text-white"}`}
            >
              {c.connected ? t({ ka: "გათიშვა", en: "Disconnect" }) : t({ ka: "ჩართვა", en: "Turn on" })}
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
