import { matchHeaders, REQUIRED_COLUMNS, type ColumnKey } from "./columns";
import { checkRow, type ImportRow, type RowProblem } from "./importRow";

export const MAX_IMPORT_ROWS = 2000;

/** `line` is the spreadsheet's own row number; `other` is the earlier row a duplicate code is on. */
export type RowError = { line: number; problem: RowProblem; other?: number };

export type TableProblem = "columns" | "empty" | "too_many";

export type ParsedTable =
  | { ok: true; rows: ImportRow[]; errors: RowError[] }
  | { ok: false; error: TableProblem };

/** Reads a sheet whose first row is the header. Blank lines are skipped; each code may appear once. */
export function tableToRows(table: string[][]): ParsedTable {
  const [header = [], ...body] = table;
  const keys = matchHeaders(header);
  if (!REQUIRED_COLUMNS.every((key) => keys.includes(key))) return { ok: false, error: "columns" };

  const lines = body
    .map((cells, i) => ({ line: i + 2, cells }))
    .filter(({ cells }) => cells.some((cell) => (cell ?? "").trim() !== ""));
  if (lines.length === 0) return { ok: false, error: "empty" };
  if (lines.length > MAX_IMPORT_ROWS) return { ok: false, error: "too_many" };

  const rows: ImportRow[] = [];
  const errors: RowError[] = [];
  const seenOn = new Map<string, number>();

  for (const { line, cells } of lines) {
    const record: Partial<Record<ColumnKey, string>> = {};
    keys.forEach((key, i) => {
      if (key) record[key] = cells[i] ?? "";
    });

    const result = checkRow(record);
    if ("problem" in result) {
      errors.push({ line, problem: result.problem });
      continue;
    }
    const earlier = seenOn.get(result.row.code);
    if (earlier !== undefined) {
      errors.push({ line, problem: "duplicate", other: earlier });
      continue;
    }
    seenOn.set(result.row.code, line);
    rows.push(result.row);
  }

  return { ok: true, rows, errors };
}
