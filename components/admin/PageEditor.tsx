"use client";

import { IconExternalLink } from "@tabler/icons-react";
import { useUrlTab } from "@/hooks/useUrlTab";
import { findAdminPage, sectionRoute } from "@/lib/admin/pages";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { SectionEditor } from "./SectionEditor";
import type { SectionData } from "./sectionData";
import { SectionLayout, SectionRail } from "./ui/SectionRail";

export function PageEditor({ slug, data }: { slug: string; data: Record<string, SectionData> }) {
  const { t } = useLanguage();
  const page = findAdminPage(slug);
  const keys = page?.sections.map((s) => s.key) ?? [];
  const [active, setActive] = useUrlTab("section", keys, keys[0] ?? "");

  if (!page) return null;
  const current = data[active];

  return (
    <>
      <div className="mb-6 flex max-w-[1370px] flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold">{t(page.label)}</h1>
          <p className="mt-1 text-sm text-muted">{t("admin.pageEditor.pickASectionAnd")}</p>
        </div>
        <a
          href={sectionRoute(page, page.sections.find((s) => s.key === active))}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-border px-3 text-[13px] font-medium text-muted hover:text-ink"
        >
          <IconExternalLink size={15} />
          {t("admin.pageEditor.viewPage")}
        </a>
      </div>

      {page.sections.length === 1 ? (
        current ? <div className="max-w-[1100px]"><SectionEditor data={current} /></div> : null
      ) : (
        <SectionLayout rail={<SectionRail items={page.sections} active={active} onSelect={setActive} />}>
          {current ? <SectionEditor data={current} /> : null}
        </SectionLayout>
      )}
    </>
  );
}
