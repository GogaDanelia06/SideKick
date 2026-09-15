"use server";

import type { AiConfig } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { DEFAULT_AI_LANGUAGE, MAX_AI_LANGUAGES, cleanLanguages } from "@/lib/dashboard/aiLanguages";
import { DASH } from "@/lib/dashboard/routes";
import { checkbox, optionalField } from "@/lib/forms";
import type { ActionResult } from "./result";

export type LanguagesError = "forbidden" | "empty" | "too_many";

type AiConfigFields = Partial<Omit<AiConfig, "id" | "businessId" | "updatedAt">>;

const MAX_REPLY_DELAY_SEC = 120;

async function saveConfig(businessId: string, fields: AiConfigFields) {
  await prisma.aiConfig.upsert({
    where: { businessId },
    update: fields,
    create: { businessId, languages: [DEFAULT_AI_LANGUAGE], ...fields },
  });
  revalidatePath(DASH.ai);
}

export async function saveAiCharacter(fd: FormData): Promise<ActionResult> {
  const ctx = await requirePermission("ai:write");
  if (!ctx) return { ok: false, error: "forbidden" };

  await saveConfig(ctx.businessId, {
    style: optionalField(fd, "style"),
    length: optionalField(fd, "length"),
    emoji: optionalField(fd, "emoji"),
    addressForm: optionalField(fd, "addressForm"),
    roles: fd.getAll("roles").map(String),
  });
  return { ok: true };
}

export async function saveAiRules(fd: FormData): Promise<ActionResult> {
  const ctx = await requirePermission("ai:write");
  if (!ctx) return { ok: false, error: "forbidden" };

  await saveConfig(ctx.businessId, {
    roles: fd.getAll("roles").map(String),
    handoffRule: optionalField(fd, "handoffRule"),
    // Clamped on the server: the value decides how long a function is held open.
    replyDelaySec: Math.min(MAX_REPLY_DELAY_SEC, Math.max(0, Number(fd.get("replyDelaySec")) || 0)),
    leadEnabled: checkbox(fd, "leadEnabled"),
    leadRule: optionalField(fd, "leadRule"),
    orderEnabled: checkbox(fd, "orderEnabled"),
    orderRule: optionalField(fd, "orderRule"),
    allowOrderEdit: checkbox(fd, "allowOrderEdit"),
    faqText: optionalField(fd, "faqText"),
    policies: optionalField(fd, "policies"),
  });
  return { ok: true };
}

export async function saveAiPrompt(fd: FormData): Promise<ActionResult> {
  const ctx = await requirePermission("ai:write");
  if (!ctx) return { ok: false, error: "forbidden" };

  await saveConfig(ctx.businessId, { prompt: optionalField(fd, "prompt") });
  return { ok: true };
}

export async function setAiLanguages(
  languages: string[],
): Promise<{ ok: true } | { ok: false; error: LanguagesError }> {
  const ctx = await requirePermission("ai:write");
  if (!ctx) return { ok: false, error: "forbidden" };

  const clean = cleanLanguages(languages);
  if (clean.length === 0) return { ok: false, error: "empty" };
  if (clean.length > MAX_AI_LANGUAGES) return { ok: false, error: "too_many" };

  await saveConfig(ctx.businessId, { languages: clean });
  return { ok: true };
}
