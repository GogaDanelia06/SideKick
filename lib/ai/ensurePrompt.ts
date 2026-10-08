import { prisma } from "@/lib/db";
import { DEFAULT_AI_LANGUAGE } from "@/lib/dashboard/aiLanguages";
import { log } from "@/lib/logger";
import { buildPrompt } from "./client";

/** What a business starts from when it has written no prompt and the AI service could not draft one. */
export function starterPrompt(name: string, field?: string | null): string {
  const about = field?.trim() ? ` (${field.trim()})` : "";
  return (
    `შენ ხარ „${name}“-ის${about} ვირტუალური ასისტენტი. პასუხობ კლიენტებს თავაზიანად, მოკლედ და ზუსტად, ` +
    "ეხმარები პროდუქტის შერჩევასა და შეკვეთის გაფორმებაში. თუ პასუხი არ იცი, პატიოსნად აღიარე " +
    "და შესთავაზე ადამიანთან დაკავშირება."
  );
}

async function starter(businessId: string): Promise<string | null> {
  const business = await prisma.business.findUnique({ where: { id: businessId }, select: { name: true, field: true } });
  return business ? starterPrompt(business.name, business.field) : null;
}

/**
 * The AI service answers from the business's saved prompt, and refuses — 404, "No prompt
 * found" — when there is none. A new business has none until its owner writes or generates
 * one, so without this its customers got no reply at all, and its owner's test failed.
 *
 * A business without a prompt is given one before the AI is asked: drafted by the AI service
 * from the business profile, or, if that fails, a short starter text. The owner sees it on
 * the AI page and can change it. Returns whether it had to give one.
 */
export async function ensurePrompt(businessId: string): Promise<boolean> {
  const config = await prisma.aiConfig.findUnique({ where: { businessId }, select: { prompt: true } });
  if (config?.prompt?.trim()) return false;

  const drafted = await buildPrompt(businessId);
  const prompt = drafted ?? (await starter(businessId));
  if (!prompt) return false;

  // Only over what was seen empty: a prompt the owner saved while this was drafting stays.
  const { count } = await prisma.aiConfig.updateMany({
    where: { businessId, prompt: config?.prompt ?? null },
    data: { prompt },
  });
  let gave = count > 0;
  if (!gave && !config) {
    // No config row at all; if another request made it first, that one's prompt stands.
    gave = await prisma.aiConfig
      .create({ data: { businessId, prompt, languages: [DEFAULT_AI_LANGUAGE], roles: [] } })
      .then(() => true, () => false);
  }

  if (gave) log.info("gave a business a prompt to start from", { businessId, source: drafted ? "ai" : "starter" });
  return gave;
}
