"use client";

import { createContext } from "react";

/**
 * A section's save state, for controls inside it that work on the saved text. The prompt's
 * AI buttons save what the merchant wrote before they start, and tell the section that the
 * text they bring back is already saved on the server.
 */
export type SectionSaveState = {
  dirty: boolean;
  saving: boolean;
  /** Sends the form; true once the server holds what it shows. */
  save: () => Promise<boolean>;
  adopt: () => void;
};

export const SectionSaveContext = createContext<SectionSaveState>({
  dirty: false,
  saving: false,
  save: async () => true,
  adopt: () => {},
});
