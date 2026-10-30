"use client";

import { useState } from "react";
import type { AccountProfile } from "@/lib/channels/accountProfile";
import { useLanguage } from "@/lib/i18n/useLanguage";

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

function Avatar({ src, name }: { src: string | null; name: string }) {
  const [broken, setBroken] = useState(false);

  if (!src || broken) {
    return (
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-card text-sm font-semibold text-muted">
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Meta's signed CDN url, already 96px
    <img
      src={src}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
      className="size-9 shrink-0 rounded-full object-cover"
    />
  );
}

export function AccountCard({ account }: { account: AccountProfile | null }) {
  const { t } = useLanguage();

  if (!account) {
    return <p className="mt-2 text-xs text-amber">{t("dashboard.channels.account.unavailable")}</p>;
  }

  const details = [
    account.username ? `@${account.username}` : null,
    account.followers === null
      ? null
      : t(account.followers === 1 ? "dashboard.channels.account.followersOne" : "dashboard.channels.account.followers", {
          count: compact.format(account.followers),
        }),
    account.posts === null
      ? null
      : t(account.posts === 1 ? "dashboard.channels.account.postsOne" : "dashboard.channels.account.posts", {
          count: compact.format(account.posts),
        }),
  ].filter(Boolean);

  const body = (
    <>
      <Avatar src={account.picture} name={account.name} />
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-medium">{account.name}</span>
        {details.length > 0 ? <span className="block truncate text-xs text-muted">{details.join(" · ")}</span> : null}
      </span>
    </>
  );
  const box = "mt-2.5 flex w-fit max-w-full items-center gap-2.5 rounded-[10px] border border-border2 bg-soft py-1.5 pl-1.5 pr-3";

  if (!account.link) return <div className={box}>{body}</div>;
  return (
    <a
      href={account.link}
      target="_blank"
      rel="noopener noreferrer"
      title={t("dashboard.channels.account.open")}
      className={`${box} transition-colors hover:border-border`}
    >
      {body}
    </a>
  );
}
