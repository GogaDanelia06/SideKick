import { prisma } from "@/lib/db";
import { DEFAULT_AI_LANGUAGE } from "@/lib/dashboard/aiLanguages";
import { log } from "@/lib/logger";
import { buildPrompt } from "./client";

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

export async function ensurePrompt(businessId: string): Promise<boolean> {
  const config = await prisma.aiConfig.findUnique({ where: { businessId }, select: { prompt: true } });
  if (config?.prompt?.trim()) return false;

  const drafted = await buildPrompt(businessId);
  const prompt = drafted ?? (await starter(businessId));
  if (!prompt) return false;

  const { count } = await prisma.aiConfig.updateMany({
    where: { businessId, prompt: config?.prompt ?? null },
    data: { prompt },
  });
  let gave = count > 0;
  if (!gave && !config) {
    gave = await prisma.aiConfig
      .create({ data: { businessId, prompt, languages: [DEFAULT_AI_LANGUAGE], roles: [] } })
      .then(() => true, () => false);
  }

  if (gave) log.info("gave a business a prompt to start from", { businessId, source: drafted ? "ai" : "starter" });
  return gave;
}
