"use client";

import type { Product } from "@prisma/client";
import { IconAlertTriangle, IconDownload, IconUpload } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { downloadXlsx, stockRows, templateRows } from "@/lib/products/download";
import { ChosenFileCard } from "./ChosenFileCard";
import { FILE_PROBLEMS, IMPORT_NOTE } from "./importText";
import { useProductFile } from "./useProductFile";

const SECONDARY =
  "inline-flex h-10 items-center gap-2 rounded-[6px] border border-border px-4 text-[13px] font-medium disabled:opacity-50";

/** Products in and out as a spreadsheet: import an .xlsx or .csv, download the template or the stock. */
export function FileUploadTab({ products }: { products: Product[] }) {
  const { t, locale } = useLanguage();
  const { input, chosen, problem, result, reading, importing, choose, remove, importNow } = useProductFile();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <Panel className="p-5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={importing}
          className="inline-flex h-10 items-center gap-2 rounded-[6px] bg-primary px-4 text-[13px] font-medium text-white disabled:opacity-60"
        >
          <IconUpload size={16} /> {t({ ka: "ატვირთე EXCEL / CSV", en: "Upload EXCEL / CSV" })}
        </button>
        <input
          ref={input}
          type="file"
          accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
          className="hidden"
          onChange={(e) => void choose(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => void downloadXlsx("sidekick-products-template.xlsx", templateRows(locale))}
          className={SECONDARY}
        >
          <IconDownload size={16} /> {t({ ka: "ჩამოტვირთე შაბლონი", en: "Download template" })}
        </button>
        <button
          type="button"
          onClick={() => void downloadXlsx(`sidekick-products-${today}.xlsx`, stockRows(products, locale))}
          disabled={products.length === 0}
          className={SECONDARY}
        >
          <IconDownload size={16} /> {t({ ka: "ჩამოტვირთე მარაგი", en: "Download stock" })}
        </button>
      </div>

      {reading ? (
        <p className="mt-4 text-[13px] text-muted">{t({ ka: "ფაილი იკითხება…", en: "Reading the file…" })}</p>
      ) : null}
      {problem ? (
        <p className="mt-4 flex items-start gap-2 text-[13px] text-red">
          <IconAlertTriangle size={16} className="mt-0.5 shrink-0" />
          {t(FILE_PROBLEMS[problem])}
        </p>
      ) : null}
      {chosen ? (
        <ChosenFileCard file={chosen} result={result} importing={importing} onRemove={remove} onImport={importNow} />
      ) : null}

      <p className="mt-4 text-xs text-faint">{t(IMPORT_NOTE)}</p>
    </Panel>
  );
}
