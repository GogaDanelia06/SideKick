import { prisma } from "@/lib/db";
import { CONTACT_DEFAULTS, CONTACT_KEYS, toContactDetails, type ContactDetails } from "@/lib/content/contactDetails";
import { log } from "@/lib/logger";

/**
 * The contact details the admin panel saved. The panel writes the whole group at once, so a
 * blank value there means "do not show this"; before the first save there are no rows at
 * all, and the company's own details from the code stand in. The footer is on every page,
 * so a database that does not answer gets the same stand-in rather than an error page.
 */
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
