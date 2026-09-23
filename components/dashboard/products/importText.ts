import type { ImportResult } from "@/lib/dashboard/actions/productImport";
import type { RowProblem } from "@/lib/products/importRow";
import { MAX_IMPORT_ROWS, type RowError } from "@/lib/products/importRows";
import type { FileProblem } from "@/lib/products/readFile";
import type { Text } from "@/lib/i18n/messages";
import { phrase, textIn } from "@/lib/i18n/messages";

export const FILE_PROBLEMS: Record<FileProblem, Text> = {
  size: "dashboard.products.importText.theFileIsLarger",
  type: "dashboard.products.importText.uploadAnXlsxOr",
  unreadable: "dashboard.products.importText.theFileCouldNot",
  columns: "dashboard.products.importText.theFileNeedsThe",
  empty: "dashboard.products.importText.empty",
  too_many: phrase("dashboard.products.importText.atMostRows", { max: MAX_IMPORT_ROWS }),
};

const ROW_PROBLEMS: Record<Exclude<RowProblem, "duplicate">, Text> = {
  code: "dashboard.products.importText.theCodeIsEmpty",
  name: "dashboard.products.importText.theNameIsEmpty",
  price: "dashboard.products.importText.thePriceMustBe",
  discount: "dashboard.products.importText.theDiscountMustBe",
  sale: "dashboard.products.importText.theSalePriceMust",
  quantity: "dashboard.products.importText.theQuantityMustBe",
  too_long: "dashboard.products.importText.aTextIsToo",
};

export function rowErrorText({ line, problem, other }: RowError): Text {
  const what: Text =
    problem === "duplicate"
      ? phrase("dashboard.products.importText.duplicateOfRow", { other: other ?? "" })
      : ROW_PROBLEMS[problem];
  return { ka: `ხაზი ${line}: ${textIn("ka", what)}`, en: `Row ${line}: ${textIn("en", what)}` };
}

export function importResultText(result: ImportResult): Text {
  if (result.ok) {
    return phrase("dashboard.products.importText.done", { created: result.created, updated: result.updated });
  }
  switch (result.error) {
    case "limit":
      return phrase("dashboard.products.importText.planLimit", {
        limit: result.limit,
        used: result.used,
        adding: result.adding,
      });
    case "forbidden":
      return "dashboard.products.importText.youMayNotImport";
    case "invalid":
      return "dashboard.products.importText.theFileSData";
    case "failed":
      return "dashboard.products.importText.theImportFailedTry";
  }
}

export const IMPORT_NOTE: Text = "dashboard.products.importText.productsAreMatchedBy";
