"use client";

import { createContext } from "react";

export type SectionSaveState = {
  dirty: boolean;
  saving: boolean;
};

export const SectionSaveContext = createContext<SectionSaveState>({ dirty: false, saving: false });
