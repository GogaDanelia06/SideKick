import { describe, it, expect } from "vitest";
import { strToU8, zipSync } from "fflate";
import { parseCsv } from "./csv";
import { readXlsx } from "./xlsxRead";
import { writeXlsx } from "./xlsxWrite";

const toBuffer = (bytes: Uint8Array) => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

describe("parseCsv()", () => {
  it("reads quoted fields, escaped quotes and line breaks inside quotes", () => {
    const csv = 'code,name,description\r\nA-1,"Dress, white","He said ""hi""\nsecond line"\r\n';
    expect(parseCsv(csv)).toEqual([
      ["code", "name", "description"],
      ["A-1", "Dress, white", 'He said "hi"\nsecond line'],
    ]);
  });

  it("takes the semicolons Excel writes where the decimal mark is a comma", () => {
    expect(parseCsv("﻿კოდი;ფასი\nA-1;12,5")).toEqual([
      ["კოდი", "ფასი"],
      ["A-1", "12,5"],
    ]);
  });

  it("keeps a last line without a line break, and empty cells", () => {
    expect(parseCsv("a,b,c\n1,,3")).toEqual([
      ["a", "b", "c"],
      ["1", "", "3"],
    ]);
  });
});

describe("writeXlsx() / readXlsx()", () => {
  it("round-trips text, Georgian, numbers and blanks", async () => {
    const rows = [
      ["კოდი", "დასახელება", "ფასი", "ზომა"],
      ["DR-014", "თეთრი <კაბა> & \"ქუდი\"", 159, null],
      ["A-2", "Shoes", 12.5, "42"],
    ];
    const read = await readXlsx(toBuffer(await writeXlsx(rows)));
    expect(read).toEqual([
      ["კოდი", "დასახელება", "ფასი", "ზომა"],
      ["DR-014", 'თეთრი <კაბა> & "ქუდი"', "159", ""],
      ["A-2", "Shoes", "12.5", "42"],
    ]);
  });

  it("reads shared strings, rich text and cells written without positions", async () => {
    const main = 'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"';
    const xlsx = zipSync({
      "xl/workbook.xml": strToU8(`<workbook ${main} xmlns:r="r"><sheets><sheet name="S" sheetId="1" r:id="rId7"/></sheets></workbook>`),
      "xl/_rels/workbook.xml.rels": strToU8('<Relationships><Relationship Id="rId7" Target="/xl/worksheets/data.xml"/></Relationships>'),
      "xl/sharedStrings.xml": strToU8(
        `<sst ${main}><si><t>code</t></si><si><r><t>na</t></r><r><t>me</t></r><rPh><t>x</t></rPh></si><si><t>A&amp;1</t></si></sst>`,
      ),
      "xl/worksheets/data.xml": strToU8(
        `<worksheet ${main}><sheetData><row><c t="s"><v>0</v></c><c t="s"><v>1</v></c></row>` +
          `<row><c t="s"><v>2</v></c><c t="str"><v>Hat</v></c><c/><c><v>7</v></c></row></sheetData></worksheet>`,
      ),
    });
    expect(await readXlsx(toBuffer(xlsx))).toEqual([
      ["code", "name"],
      ["A&1", "Hat", "", "7"],
    ]);
  });

  it("refuses a file that is not a workbook", async () => {
    await expect(readXlsx(toBuffer(strToU8("not a zip")))).rejects.toThrow();
  });
});
