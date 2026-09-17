import type { Product } from "@prisma/client";
import type { Locale } from "@/lib/i18n/types";
import { PRODUCT_COLUMNS } from "./columns";
import { writeXlsx, type Cell } from "./xlsxWrite";

const header = (locale: Locale) => PRODUCT_COLUMNS.map((c) => c.label[locale]);

/** The header and one filled-in example, in the page's language. */
export function templateRows(locale: Locale): Cell[][] {
  const example =
    locale === "ka"
      ? ["DR-014", "თეთრი კაბა", 159, 10, 143, 12, "M", "ბამბის ზაფხულის კაბა"]
      : ["DR-014", "White dress", 159, 10, 143, 12, "M", "Cotton summer dress"];
  return [header(locale), example];
}

/** Every product, in the columns an import reads back. */
export function stockRows(products: Product[], locale: Locale): Cell[][] {
  return [
    header(locale),
    ...products.map((p) => [
      p.code,
      p.name,
      p.price,
      p.discountPct,
      p.salePrice,
      p.quantity,
      p.size,
      p.description,
    ]),
  ];
}

/** Saves rows as an .xlsx file through the browser. */
export async function downloadXlsx(filename: string, rows: Cell[][]): Promise<void> {
  const bytes = await writeXlsx(rows);
  const blob = new Blob([bytes as BlobPart], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  // Revoked on the next tick, once the download has started.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
