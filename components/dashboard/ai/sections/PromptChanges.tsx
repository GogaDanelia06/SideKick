"use client";

import { useContext } from "react";
import { SectionSaveContext } from "../sectionSaveContext";
import { PromptDiffPanel } from "./PromptDiffPanel";

export function PromptChanges({ saved, current }: { saved: string; current: string }) {
  const { dirty } = useContext(SectionSaveContext);
  if (!dirty || !saved.trim()) return null;
  return <PromptDiffPanel saved={saved} current={current} />;
}
