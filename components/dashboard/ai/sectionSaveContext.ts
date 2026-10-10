"use client";

import { createContext } from "react";

/**
 * A section's save state, for controls inside it that work on the saved text: the prompt's
 * AI rewrite has to wait until what the merchant wrote is saved.
 */
export type SectionSaveState = {
  dirty: boolean;
  saving: boolean;
};

export const SectionSaveContext = createContext<SectionSaveState>({ dirty: false, saving: false });
