"use client";

import { createContext } from "react";
import type { SectionOwner } from "@/lib/dashboard/sectionSave/request";

export const SectionOwnerContext = createContext<SectionOwner | null>(null);
