/** The delimiter the first line uses most; Excel saves ";" where the decimal mark is a comma. */
function sniff(text: string): string {
  const firstLine = text.split(/\r?\n/, 1)[0];
  let best = ",";
  let bestCount = -1;
  for (const delimiter of [",", ";", "\t"]) {
    const count = firstLine.split(delimiter).length - 1;
    if (count > bestCount) {
      best = delimiter;
      bestCount = count;
    }
  }
  return best;
}

/** CSV as Excel writes it: quoted fields with "" escapes, CRLF or LF, and an optional UTF-8 BOM. */
export function parseCsv(input: string): string[][] {
  const text = input.replace(/^﻿/, "");
  const delimiter = sniff(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch !== '"') field += ch;
      else if (text[i + 1] === '"') field += text[i++];
      else quoted = false;
    } else if (ch === '"' && field === "") {
      quoted = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) rows.push([...row, field]);
  return rows;
}
