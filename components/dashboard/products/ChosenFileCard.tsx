"use client";

import clsx from "clsx";
import { IconAlertTriangle, IconCircleCheck, IconFileSpreadsheet, IconUpload, IconX } from "@tabler/icons-react";
import type { ImportResult } from "@/lib/dashboard/actions/productImport";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { importResultText, rowErrorText } from "./importText";
import type { ChosenFile } from "./useProductFile";

/** How many row problems are listed before the rest are only counted. */
const SHOWN_ERRORS = 5;

/** The picked file: what is in it, a way to remove it, and the import itself. */
export function ChosenFileCard({
  file,
  result,
  importing,
  onRemove,
  onImport,
}: {
  file: ChosenFile;
  result: ImportResult | null;
  importing: boolean;
  onRemove: () => void;
  onImport: () => void;
}) {
  const { t } = useLanguage();
  const count = file.rows.length + file.errors.length;
  const hidden = file.errors.length - SHOWN_ERRORS;
  const done = result?.ok === true;

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-[8px] border border-border2 bg-soft py-1.5 pl-3 pr-1.5 text-[13px]">
        <IconFileSpreadsheet size={16} className="shrink-0 text-green" />
        <span className="min-w-0 flex-1 truncate text-muted">
          <span className="text-ink">{file.name}</span> · {count} {t({ ka: "პროდუქტი", en: "products" })}
          {file.errors.length > 0 ? (
            <span className="text-red"> · {file.errors.length} {t({ ka: "შეცდომა", en: "error(s)" })}</span>
          ) : null}
        </span>
        <button
          type="button"
          onClick={onRemove}
          disabled={importing}
          title={t({ ka: "ფაილის მოშორება", en: "Remove file" })}
          aria-label={t({ ka: "ფაილის მოშორება", en: "Remove file" })}
          className="grid size-7 shrink-0 place-items-center rounded-[6px] text-muted hover:bg-surface hover:text-red disabled:opacity-40"
        >
          <IconX size={16} />
        </button>
      </div>

      {file.errors.length > 0 ? (
        <div className="rounded-[8px] border border-red/40 bg-red-surface p-3 text-[13px]">
          <p className="mb-1.5 font-medium text-red">
            {t({ ka: "გაასწორე ეს ხაზები ფაილში და ატვირთე ხელახლა:", en: "Fix these rows in the file and upload it again:" })}
          </p>
          <ul className="flex flex-col gap-0.5 text-ink">
            {file.errors.slice(0, SHOWN_ERRORS).map((error) => (
              <li key={`${error.line}-${error.problem}`}>{t(rowErrorText(error))}</li>
            ))}
            {hidden > 0 ? <li className="text-muted">{t({ ka: `…და კიდევ ${hidden}`, en: `…and ${hidden} more` })}</li> : null}
          </ul>
        </div>
      ) : done ? null : (
        <button
          type="button"
          onClick={onImport}
          disabled={importing}
          className="inline-flex h-10 w-fit items-center gap-2 rounded-[6px] bg-primary px-4 text-[13px] font-medium text-white disabled:opacity-60"
        >
          <IconUpload size={16} />
          {importing
            ? t({ ka: "შემოდის…", en: "Importing…" })
            : t({ ka: `შემოიტანე ${file.rows.length} პროდუქტი`, en: `Import ${file.rows.length} products` })}
        </button>
      )}

      {result ? (
        <p className={clsx("flex items-center gap-2 text-[13px]", result.ok ? "text-green" : "text-red")}>
          {result.ok ? <IconCircleCheck size={16} /> : <IconAlertTriangle size={16} />}
          {t(importResultText(result))}
        </p>
      ) : null}
    </div>
  );
}
