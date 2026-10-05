"use client";

import { createContext } from "react";

/**
 * A section's save state, for controls inside it that change the form themselves. The
 * prompt's AI buttons save on the server: they tell the section the text they bring is
 * already saved, and they wait while the merchant has unsaved edits of their own.
 */
export type SectionSaveState = { dirty: boolean; adopt: () => void };

export const SectionSaveContext = createContext<SectionSaveState>({ dirty: false, adopt: () => {} });
