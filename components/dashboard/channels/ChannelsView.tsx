"use client";

import { useState, useTransition } from "react";
import type { ChannelType } from "@prisma/client";
// Not `Channel`: the page deliberately fetches a subset, so the access token
// never reaches this client component and therefore never reaches the browser.
import type { ChannelSummary } from "@/lib/dashboard/queries";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconBrandYoutube,
  IconChevronDown,
  IconHelpCircle,
  IconWorld,
} from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { ConnectButton, ConnectResult } from "./ConnectMeta";
import { setChannelConnected } from "@/lib/dashboard/actions";
import { guideSteps, type ChannelGuideView } from "@/lib/dashboard/tutorials";
import { useLanguage } from "@/lib/i18n/useLanguage";

const META = {
  FACEBOOK: { name: "Facebook", Icon: IconBrandFacebook, color: "#1877f2" },
  INSTAGRAM: { name: "Instagram", Icon: IconBrandInstagram, color: "#c13584" },
  WHATSAPP: { name: "WhatsApp", Icon: IconBrandWhatsapp, color: "#25d366" },
  WEBSITE: { name: "API for websites", Icon: IconWorld, color: "var(--blue)" },
} as const;

type Guides = Partial<Record<ChannelType, ChannelGuideView>>;

/** The steps and video an admin wrote for this channel, revealed in place so
 *  the tenant can follow them without leaving the connect button behind. */
function Guide({ guide }: { guide: ChannelGuideView }) {
  const { t } = useLanguage();
  const list = t(guideSteps(guide.body));

  return (
    <div className="mt-1 w-full border-t border-border pt-4">
      {list.length > 0 ? (
        <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-[13px] text-muted marker:text-faint">
          {list.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      ) : null}

      {guide.youtubeUrl ? (
        <a
          href={guide.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-border px-3 text-[13px] font-medium text-ink hover:border-red hover:text-red"
        >
          <IconBrandYoutube size={16} className="text-red" />
          {t({ ka: "ვიდეო ინსტრუქცია", en: "Video guide" })}
        </a>
      ) : null}
    </div>
  );
}

export function ChannelsView({
  channels,
  guides,
}: {
  channels: ChannelSummary[];
  guides: Guides;
}) {
  const { t } = useLanguage();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState<string | null>(null);
  const [refusal, setRefusal] = useState<string | null>(null);

  return (
    <div className="grid gap-3">

      {refusal ? <p className="text-[13px] text-red">{refusal}</p> : null}

      {channels.map((c) => {
        const m = META[c.type];
        const guide = guides[c.type];
        const expanded = open === c.id;
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
            {!c.linked ? (
              // Never authorised, so there is nothing to switch on — the only
              // useful action is the grant itself.
              <ConnectButton type={c.type} />
            ) : (
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
            )}

            <ConnectResult type={c.type} />

            {/* No button at all when the admin hasn't written a guide yet —
                better than a control that opens an empty panel. */}
            {guide ? (
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : c.id)}
                aria-expanded={expanded}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[8px] border border-border bg-surface px-3 text-[13px] font-medium text-muted hover:text-ink"
              >
                <IconHelpCircle size={16} />
                {t({ ka: "ინსტრუქცია", en: "How to connect" })}
                <IconChevronDown
                  size={15}
                  className={`transition-transform ${expanded ? "rotate-180" : ""}`}
                />
              </button>
            ) : null}

            {guide && expanded ? <Guide guide={guide} /> : null}
          </Panel>
        );
      })}
    </div>
  );
}
