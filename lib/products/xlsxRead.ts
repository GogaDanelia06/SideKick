/**
 * Reads the first sheet of an .xlsx file into rows of text. The format is a zip of XML
 * written by spreadsheet programs, regular enough to read with a few patterns.
 */

const ENTITIES: Record<string, string> = { lt: "<", gt: ">", amp: "&", quot: '"', apos: "'" };

export function decodeXml(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, name: string) => {
    if (name[0] !== "#") return ENTITIES[name] ?? whole;
    const code = name[1] === "x" || name[1] === "X" ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
    return String.fromCodePoint(code);
  });
}

/** All <t> text inside `xml`, joined; phonetic hints (<rPh>) are not part of the value. */
function texts(xml: string): string {
  const clean = xml.replace(/<rPh\b[\s\S]*?<\/rPh>/g, "");
  return [...clean.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((m) => decodeXml(m[1])).join("");
}

const attr = (attrs: string, name: string) => attrs.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];

/** "B12" → 1: the zero-based column of a cell reference. */
function columnIndex(ref: string): number {
  const letters = ref.match(/^[A-Z]+/)?.[0] ?? "A";
  return [...letters].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;
}

/** The path of the workbook's first sheet, as the workbook itself lists it. */
function firstSheetPath(files: Record<string, string>): string {
  const firstId = attr(files["xl/workbook.xml"]?.match(/<sheet\b[^>]*>/)?.[0] ?? "", "r:id");
  const rels = files["xl/_rels/workbook.xml.rels"] ?? "";
  const rel = [...rels.matchAll(/<Relationship\b[^>]*>/g)].map((m) => m[0]).find((r) => attr(r, "Id") === firstId);
  const target = rel ? attr(rel, "Target") : undefined;
  if (!target) return "xl/worksheets/sheet1.xml";
  return target.startsWith("/") ? target.slice(1) : `xl/${target}`;
}

export async function readXlsx(buffer: ArrayBuffer): Promise<string[][]> {
  const { strFromU8, unzipSync } = await import("fflate");
  const zip = unzipSync(new Uint8Array(buffer));
  const files: Record<string, string> = {};
  for (const [name, bytes] of Object.entries(zip)) {
    if (name.endsWith(".xml") || name.endsWith(".rels")) files[name] = strFromU8(bytes);
  }

  const sheet = files[firstSheetPath(files)];
  if (sheet === undefined) throw new Error("The workbook has no readable sheet.");
  const shared = [...(files["xl/sharedStrings.xml"] ?? "").matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)].map((m) =>
    texts(m[1]),
  );

  // Positions are optional in the format: without one, a row or cell follows the previous.
  const rows: string[][] = [];
  let r = -1;
  for (const [, rowAttrs, rowBody = ""] of sheet.matchAll(/<row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g)) {
    const rowRef = attr(rowAttrs, "r");
    r = rowRef ? Number(rowRef) - 1 : r + 1;
    const row = (rows[r] ??= []);
    let c = -1;
    for (const [, attrs, body = ""] of rowBody.matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const ref = attr(attrs, "r");
      c = ref ? columnIndex(ref) : c + 1;
      const type = attr(attrs, "t");
      const raw = decodeXml(body.match(/<v\b[^>]*>([\s\S]*?)<\/v>/)?.[1] ?? "");
      row[c] = type === "s" ? (shared[Number(raw)] ?? "") : type === "inlineStr" ? texts(body) : raw;
    }
  }
  return Array.from(rows, (row) => Array.from(row ?? [], (cell) => cell ?? ""));
}
