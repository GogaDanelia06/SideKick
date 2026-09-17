import type { Bilingual } from "@/lib/content/types";
import type { ImportResult } from "@/lib/dashboard/actions/productImport";
import type { RowProblem } from "@/lib/products/importRow";
import { MAX_IMPORT_ROWS, type RowError } from "@/lib/products/importRows";
import type { FileProblem } from "@/lib/products/readFile";

export const FILE_PROBLEMS: Record<FileProblem, Bilingual> = {
  size: { ka: "ფაილი 5 MB-ზე დიდია.", en: "The file is larger than 5 MB." },
  type: { ka: "ატვირთე .xlsx ან .csv ფაილი.", en: "Upload an .xlsx or .csv file." },
  unreadable: {
    ka: "ფაილი ვერ წაიკითხა. შეინახე ხელახლა .xlsx ან .csv ფორმატში.",
    en: "The file could not be read. Save it again as .xlsx or .csv.",
  },
  columns: {
    ka: "ფაილში არ მოიძებნა სვეტები „კოდი“, „დასახელება“ და „ფასი“. ჩამოტვირთე შაბლონი და გამოიყენე ის.",
    en: "The file needs the columns Code, Name and Price. Download the template and use it.",
  },
  empty: { ka: "ფაილში პროდუქტები არ არის.", en: "The file has no products in it." },
  too_many: {
    ka: `ერთ ფაილში მაქსიმუმ ${MAX_IMPORT_ROWS} პროდუქტი.`,
    en: `At most ${MAX_IMPORT_ROWS} products per file.`,
  },
};

const ROW_PROBLEMS: Record<Exclude<RowProblem, "duplicate">, Bilingual> = {
  code: { ka: "კოდი ცარიელია", en: "the code is empty" },
  name: { ka: "დასახელება ცარიელია", en: "the name is empty" },
  price: { ka: "ფასი უნდა იყოს რიცხვი, 0 ან მეტი", en: "the price must be a number, 0 or more" },
  discount: { ka: "ფასდაკლება უნდა იყოს 0-დან 100-მდე", en: "the discount must be between 0 and 100" },
  sale: { ka: "ფასდაკლებული ფასი ფასზე მეტი არ უნდა იყოს", en: "the sale price must not be above the price" },
  quantity: {
    ka: "რაოდენობა უნდა იყოს მთელი რიცხვი, 0 ან მეტი",
    en: "the quantity must be a whole number, 0 or more",
  },
  too_long: { ka: "ტექსტი ძალიან გრძელია", en: "a text is too long" },
};

export function rowErrorText({ line, problem, other }: RowError): Bilingual {
  const what =
    problem === "duplicate"
      ? { ka: `იგივე კოდი უკვე არის ${other} ხაზზე`, en: `the same code is already on row ${other}` }
      : ROW_PROBLEMS[problem];
  return { ka: `ხაზი ${line}: ${what.ka}`, en: `Row ${line}: ${what.en}` };
}

export function importResultText(result: ImportResult): Bilingual {
  if (result.ok) {
    return {
      ka: `მზაა: ${result.created} დაემატა, ${result.updated} განახლდა.`,
      en: `Done: ${result.created} added, ${result.updated} updated.`,
    };
  }
  switch (result.error) {
    case "limit":
      return {
        ka: `შენი გეგმა ${result.limit} პროდუქტს უშვებს: უკვე გაქვს ${result.used}, ფაილი ${result.adding} ახალს დაამატებდა.`,
        en: `Your plan allows ${result.limit} products: you have ${result.used}, and this file would add ${result.adding} new ones.`,
      };
    case "forbidden":
      return { ka: "პროდუქტების შემოტანის უფლება არ გაქვს.", en: "You may not import products." };
    case "invalid":
      return { ka: "ფაილის მონაცემები არასწორია. ატვირთე ხელახლა.", en: "The file's data is not valid. Upload it again." };
    case "failed":
      return { ka: "შემოტანა ვერ მოხერხდა. სცადე ხელახლა.", en: "The import failed. Try again." };
  }
}

export const IMPORT_NOTE: Bilingual = {
  ka: "პროდუქტები კოდით მოიძებნება: ახალი კოდი დაემატება, არსებული განახლდება. ცარიელი უჯრა მნიშვნელობას არ ცვლის, არაფერი წაიშლება.",
  en: "Products are matched by code: new codes are added, existing ones updated. Blank cells keep the current value, and nothing is deleted.",
};
