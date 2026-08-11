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
  /**
   * The square tile above the heading. Sign-in and sign-up leave it out and
   * pass the logo instead: those two screens are the front door, and a stranger
   * arriving from an email link should see whose site this is, not a symbol.
   * Forgot and reset keep an icon, because there the picture names the task.
   */
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
          // Taller than it looks it needs to be: with the tagline the drawing is
          // 92 units deep against 55 without, so the same CSS height would
          // shrink the letters by a third to make room for a line that would
          // then be too small to read anyway.
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
