import { prisma } from "@/lib/db";
import { CONTACT_DEFAULTS, CONTACT_KEYS, toContactDetails, type ContactDetails } from "@/lib/content/contactDetails";
import { log } from "@/lib/logger";

export async function getContactDetails(): Promise<ContactDetails> {
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: CONTACT_KEYS } },
      select: { key: true, valueKa: true },
    });
    if (rows.length === 0) return CONTACT_DEFAULTS;
    return toContactDetails(Object.fromEntries(rows.map((r) => [r.key, r.valueKa])));
  } catch (err) {
    log.error("could not read the contact details; showing the defaults", err);
    return CONTACT_DEFAULTS;
  }
}
