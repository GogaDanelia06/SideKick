"use client";

import { createElement } from "react";
import { Card } from "@/components/ui/Card";
import { resolveIcon } from "@/lib/content/icons";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual, IconType } from "@/lib/content/types";

export function ServiceCard({
  title,
  body,
  icon,
  iconName,
}: {
  title: Bilingual;
  body: Bilingual;
  /** Component from the shipped copy (fallback path). */
  icon?: IconType;
  /** Icon name stored in the database (admin-editable path). */
  iconName?: string;
}) {
  const { t } = useLanguage();
  // createElement rather than binding to a capitalised local: assigning a
  // component to a variable inside render trips React's "component created
  // during render" rule, even though this is only a lookup.
  const iconComponent = iconName ? resolveIcon(iconName) : (icon ?? resolveIcon(null));

  return (
    <Card className="p-[22px]">
      <div className="flex items-center gap-3">
        <div className="grid size-[42px] shrink-0 place-items-center rounded-[10px] bg-blue-surface text-blue">
          {createElement(iconComponent, { size: 21 })}
        </div>
        <h3 className="flex-1 text-base font-semibold">{t(title)}</h3>
      </div>
      <div className="mt-3.5 whitespace-pre-line border-t border-border pt-3.5 text-sm leading-[1.7] text-muted">
        {t(body)}
      </div>
    </Card>
  );
}
