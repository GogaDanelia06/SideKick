"use client";

import { IconTool } from "@tabler/icons-react";
import { Panel } from "./ui/Panel";
import { useLanguage } from "@/lib/i18n/useLanguage";

/** Temporary body for sections not yet built out (keeps nav complete). */
export function SectionPlaceholder() {
  const { t } = useLanguage();

  return (
    <Panel className="grid place-items-center px-6 py-20 text-center">
      <div className="max-w-sm">
        <span className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-soft text-muted">
          <IconTool size={22} />
        </span>
        <p className="text-sm text-muted">
          {t({
            ka: "ეს განყოფილება მალე დაემატება.",
            en: "This section is coming soon.",
          })}
        </p>
      </div>
    </Panel>
  );
}
