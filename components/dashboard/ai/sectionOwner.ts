"use client";

import { createContext } from "react";
import type { SectionOwner } from "@/lib/dashboard/sectionSave/request";

/** Who the AI page was opened for; set by AiSections, read by each section when it saves. */
export const SectionOwnerContext = createContext<SectionOwner | null>(null);
