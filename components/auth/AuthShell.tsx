"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Wordmark } from "@/components/ui/Wordmark";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual, IconType } from "@/lib/content/types";

export function AuthShell({
  icon: Icon,
  iconTone = "primary",
  title,
  sub,
  width = 400,
  children,
  footer,
}: {
  /** Tile icon for forgot/reset; sign-in and sign-up show the logo instead. */
  icon?: IconType;
  iconTone?: "primary" | "outline";
  title: Bilingual;
  sub: Bilingual;
  width?: number;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <div className="w-full" style={{ maxWidth: width }}>
      <div className="mb-7 text-center">
        {Icon ? (
          <span
            className={clsx(
              "inline-grid size-11 place-items-center rounded-lg",
              iconTone === "primary"
                ? "bg-primary text-white"
                : "border border-border bg-card text-blue",
            )}
          >
            <Icon size={24} />
          </span>
        ) : (
          <Wordmark className="mx-auto h-[46px]" tagline />
        )}
        <h1 className="mt-3.5 text-[26px] font-semibold">{t(title)}</h1>
        <p className="mt-1.5 text-sm text-muted">{t(sub)}</p>
      </div>
      <Card className="rounded-lg p-[26px]">{children}</Card>
      {footer ? <p className="mt-5 text-center text-sm text-muted">{footer}</p> : null}
    </div>
  );
}
