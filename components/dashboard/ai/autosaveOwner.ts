"use client";

import { createContext } from "react";
import type { AutosaveOwner } from "@/lib/dashboard/autosave/request";

/** Who the AI page was opened for; set by AiSections, read by each section's autosave. */
export const AutosaveOwnerContext = createContext<AutosaveOwner | null>(null);
