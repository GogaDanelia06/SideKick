"use client";

import { useRef, useState, useTransition } from "react";
import { importProducts, type ImportResult } from "@/lib/dashboard/actions/productImport";
import type { ImportRow } from "@/lib/products/importRow";
import type { RowError } from "@/lib/products/importRows";
import { readProductFile, type FileProblem } from "@/lib/products/readFile";

export type ChosenFile = { name: string; rows: ImportRow[]; errors: RowError[] };

/** The chosen product file: reading it, removing it, and importing it. */
export function useProductFile() {
  const input = useRef<HTMLInputElement>(null);
  const [chosen, setChosen] = useState<ChosenFile | null>(null);
  const [problem, setProblem] = useState<FileProblem | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [reading, setReading] = useState(false);
  const [importing, start] = useTransition();
  // Only the latest pick counts, if one file is chosen while another is still being read.
  const pick = useRef(0);

  function remove() {
    pick.current++;
    setChosen(null);
    setProblem(null);
    setResult(null);
    setReading(false);
    if (input.current) input.current.value = "";
  }

  async function choose(file: File | undefined) {
    remove();
    if (!file) return;
    const mine = pick.current;
    setReading(true);
    const parsed = await readProductFile(file);
    if (mine !== pick.current) return;
    setReading(false);
    if (parsed.ok) setChosen({ name: file.name, rows: parsed.rows, errors: parsed.errors });
    else setProblem(parsed.error);
  }

  function importNow() {
    if (!chosen || chosen.errors.length > 0 || chosen.rows.length === 0) return;
    setResult(null);
    start(async () => {
      const res = await importProducts(chosen.rows).catch((): ImportResult => ({ ok: false, error: "failed" }));
      setResult(res);
    });
  }

  return { input, chosen, problem, result, reading, importing, choose, remove, importNow };
}
