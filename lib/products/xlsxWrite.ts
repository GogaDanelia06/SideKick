/** Writes rows into a one-sheet .xlsx that Excel, Numbers and Google Sheets open as is. */

export type Cell = string | number | null | undefined;

const escape = (s: string) =>
  s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch] ?? ch);

function columnName(index: number): string {
  let name = "";
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    name = String.fromCharCode(65 + ((n - 1) % 26)) + name;
  }
  return name;
}

const HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const RELS = "http://schemas.openxmlformats.org/package/2006/relationships";
const DOC_RELS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml";

function sheetXml(rows: Cell[][]): string {
  const body = rows
    .map((row, r) => {
      const cells = row.map((value, c) => {
        const ref = `${columnName(c)}${r + 1}`;
        // The first row is the header, drawn bold (style 1).
        const style = r === 0 ? ' s="1"' : "";
        if (typeof value === "number" && Number.isFinite(value)) return `<c r="${ref}"${style}><v>${value}</v></c>`;
        const text = value == null ? "" : escape(String(value));
        return `<c r="${ref}"${style} t="inlineStr"><is><t xml:space="preserve">${text}</t></is></c>`;
      });
      return `<row r="${r + 1}">${cells.join("")}</row>`;
    })
    .join("");
  const width = Math.max(1, ...rows.map((row) => row.length));
  return `${HEAD}<worksheet xmlns="${MAIN}"><cols><col min="1" max="${width}" width="24" customWidth="1"/></cols><sheetData>${body}</sheetData></worksheet>`;
}

const STYLES = `${HEAD}<styleSheet xmlns="${MAIN}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs></styleSheet>`;

export async function writeXlsx(rows: Cell[][], sheetName = "Products"): Promise<Uint8Array> {
  const { strToU8, zipSync } = await import("fflate");
  const files: Record<string, string> = {
    "[Content_Types].xml": `${HEAD}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="${TYPE}.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="${TYPE}.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="${TYPE}.styles+xml"/></Types>`,
    "_rels/.rels": `${HEAD}<Relationships xmlns="${RELS}"><Relationship Id="rId1" Type="${DOC_RELS}/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    "xl/workbook.xml": `${HEAD}<workbook xmlns="${MAIN}" xmlns:r="${DOC_RELS}"><sheets><sheet name="${escape(sheetName)}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    "xl/_rels/workbook.xml.rels": `${HEAD}<Relationships xmlns="${RELS}"><Relationship Id="rId1" Type="${DOC_RELS}/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="${DOC_RELS}/styles" Target="styles.xml"/></Relationships>`,
    "xl/worksheets/sheet1.xml": sheetXml(rows),
    "xl/styles.xml": STYLES,
  };
  return zipSync(Object.fromEntries(Object.entries(files).map(([name, xml]) => [name, strToU8(xml)])));
}
