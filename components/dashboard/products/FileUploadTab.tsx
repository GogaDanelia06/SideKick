"use client";

import { IconDownload, IconFileSpreadsheet, IconUpload } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { useLanguage } from "@/lib/i18n/useLanguage";

export function FileUploadTab() {
  const { t } = useLanguage();
  return (
    <Panel className="p-5">
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[6px] bg-primary px-4 text-[13px] font-medium text-white">
          <IconUpload size={16} /> {t({ ka: "ატვირთე EXCEL / CSV", en: "Upload EXCEL / CSV" })}
          <input type="file" accept=".csv,.xlsx,.xls" className="hidden" />
        </label>
        <button type="button" className="inline-flex h-10 items-center gap-2 rounded-[6px] border border-border px-4 text-[13px] font-medium">
          <IconDownload size={16} /> {t({ ka: "ჩამოტვირთე შაბლონი", en: "Download template" })}
        </button>
        <button type="button" className="inline-flex h-10 items-center gap-2 rounded-[6px] border border-border px-4 text-[13px] font-medium">
          <IconDownload size={16} /> {t({ ka: "ჩამოტვირთე მარაგი", en: "Download stock" })}
        </button>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-[8px] border border-border2 bg-soft px-3 py-2 text-[13px] text-muted">
        <IconFileSpreadsheet size={16} className="text-green" /> products_2026.csv · 142 {t({ ka: "პროდუქტი", en: "products" })}
      </div>
      <p className="mt-3 text-xs text-faint">
        {t({ ka: "ცვლილება ინახება მხოლოდ ლოკალურ ფაილში.", en: "Edits are saved to the local file only." })}
      </p>
    </Panel>
  );
}
