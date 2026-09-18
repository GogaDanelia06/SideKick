import { NextResponse } from "next/server";
import { saveBusinessInfo } from "@/lib/dashboard/actions/business";
import { saveAiCharacter, saveAiPrompt, saveAiRules } from "@/lib/dashboard/actions/aiConfig";
import type { ActionResult } from "@/lib/dashboard/actions/result";
import { isSaveRequest, type AutosaveSection, type SaveError } from "@/lib/dashboard/autosave/request";
import { log } from "@/lib/logger";
import { getContext } from "@/lib/session";

/** The actions the section forms used to submit, so validation and permissions stay in one place. */
const SAVERS: Record<AutosaveSection, (fd: FormData) => Promise<ActionResult>> = {
  business: saveBusinessInfo,
  character: saveAiCharacter,
  rules: saveAiRules,
  prompt: saveAiPrompt,
};

/** The same limit server actions have. */
const MAX_BYTES = 1024 * 1024;

const refuse = (error: SaveError, status: number) => NextResponse.json({ ok: false, error }, { status });

function readBody(bytes: ArrayBuffer): unknown {
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

/**
 * Autosave for the AI page: a section sends its whole form when the user leaves it
 * (lib/dashboard/autosave). A fetch rather than a server action, because only a
 * `keepalive` fetch outlives a closing tab.
 */
export async function POST(request: Request) {
  // The session cookie is SameSite=Lax already; this also turns away other sites outright.
  const site = request.headers.get("sec-fetch-site");
  const json = request.headers.get("content-type")?.startsWith("application/json");
  if ((site && site !== "same-origin") || !json) return refuse("invalid", 400);

  if (Number(request.headers.get("content-length")) > MAX_BYTES) return refuse("invalid", 413);
  const bytes = await request.arrayBuffer();
  if (bytes.byteLength > MAX_BYTES) return refuse("invalid", 413);

  const body = readBody(bytes);
  if (!isSaveRequest(body)) return refuse("invalid", 400);

  const ctx = await getContext();
  if (!ctx) return refuse("signed_out", 401);
  // The page was opened for another login or business (switched in another tab): not here.
  if (ctx.userId !== body.userId || ctx.businessId !== body.businessId) return refuse("moved", 409);

  const fd = new FormData();
  for (const [name, value] of body.entries) fd.append(name, value);

  try {
    const result = await SAVERS[body.section](fd);
    return result.ok ? NextResponse.json({ ok: true }) : refuse("forbidden", 403);
  } catch (err) {
    log.error("AI section autosave failed", err, { businessId: ctx.businessId, section: body.section });
    return refuse("failed", 500);
  }
}
