"use client";

import clsx from "clsx";
import { IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { ACTIONS } from "@/lib/content/common";
import { PACKAGE_META, type Package } from "@/lib/content/packages";
import { ROUTES } from "@/lib/routes";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function PackageCard({ pkg }: { pkg: Package }) {
  const { t } = useLanguage();

  return (
    <div
      className={clsx(
        "relative rounded-lg border bg-card p-7",
        pkg.featured ? "border-blue-ring" : "border-border",
      )}
    >
      {pkg.featured ? (
        <span className="absolute -top-[11px] left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
          {t(PACKAGE_META.popular)}
        </span>
      ) : null}
      <h3 className="text-xl font-semibold">{t(pkg.name)}</h3>
      <div className="my-3.5 flex items-end gap-1">
        <span className="font-mono text-[38px] font-medium leading-none">{pkg.price}</span>
        <span className="text-[15px] text-muted">{t(PACKAGE_META.unit)}</span>
      </div>
      <Button
        href={ROUTES.register}
        variant={pkg.featured ? "primary" : "outline"}
        className="mb-5 w-full"
      >
        {t(ACTIONS.getStarted)}
      </Button>
      <div className="flex flex-col gap-2.5">
        {pkg.features.map((f, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <IconCheck size={16} className="mt-0.5 shrink-0 text-green" />
            <span className="text-muted">{t(f)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
