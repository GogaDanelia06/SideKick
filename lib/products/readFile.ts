import { parseCsv } from "./csv";
import { tableToRows, type ParsedTable, type TableProblem } from "./importRows";
import { readXlsx } from "./xlsxRead";

export const MAX_FILE_BYTES = 5 * 1024 * 1024;

export type FileProblem = TableProblem | "size" | "type" | "unreadable";

/** Reads a product file chosen in the browser into checked rows. */
export async function readProductFile(file: File): Promise<ParsedTable | { ok: false; error: FileProblem }> {
  if (file.size > MAX_FILE_BYTES) return { ok: false, error: "size" };

  const extension = file.name.toLowerCase().split(".").pop();
  if (extension !== "xlsx" && extension !== "csv") return { ok: false, error: "type" };

  let table: string[][];
  try {
    const buffer = await file.arrayBuffer();
    table = extension === "xlsx" ? await readXlsx(buffer) : parseCsv(new TextDecoder("utf-8").decode(buffer));
  } catch {
    return { ok: false, error: "unreadable" };
  }
  return tableToRows(table);
}
