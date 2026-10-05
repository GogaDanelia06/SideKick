/**
 * The company's contact details, as the admin panel's "Contact details" group holds them:
 * one email, one phone and four social profiles, shown on the contact page, in the footer
 * and in the structured data search engines read. Typed in by hand, so each value is turned
 * into a link that can only go where it should: mailto, tel, or an http(s) profile.
 */
export type SocialNetwork = "facebook" | "instagram" | "whatsapp" | "linkedin";

export type ContactLink = { value: string; href: string };

export type ContactDetails = {
  email: ContactLink | null;
  phone: ContactLink | null;
  socials: ({ network: SocialNetwork } & ContactLink)[];
};

const SOCIAL_KEYS: Record<SocialNetwork, string> = {
  facebook: "social_facebook",
  instagram: "social_instagram",
  whatsapp: "social_whatsapp",
  linkedin: "social_linkedin",
};

export const CONTACT_KEYS = ["contact_email", "contact_phone", ...Object.values(SOCIAL_KEYS)];

const EMAIL = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/;

export function mailLink(raw: string): ContactLink | null {
  const email = raw.trim();
  return EMAIL.test(email) ? { value: email, href: `mailto:${email}` } : null;
}

/** As people write it; a Georgian mobile written without its country code gets +995. */
export function phoneLink(raw: string): ContactLink | null {
  const value = raw.trim();
  const digits = value.replace(/\D/g, "");
  if (digits.length < 3) return null;
  const international = value.startsWith("+") ? `+${digits}` : /^5\d{8}$/.test(digits) ? `+995${digits}` : digits;
  return { value, href: `tel:${international}` };
}

/** A profile however it was pasted: a full address, one without https://, or for WhatsApp a number. */
export function socialLink(network: SocialNetwork, raw: string): ContactLink | null {
  const value = raw.trim();
  if (!value) return null;
  if (network === "whatsapp" && !/[a-z]/i.test(value)) {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 7 ? { value, href: `https://wa.me/${digits}` } : null;
  }
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return url.protocol === "https:" || url.protocol === "http:" ? { value: handleOf(url), href: url.href } : null;
  } catch {
    return null;
  }
}

/** What a profile address shows as: its handle when it has a clean one, else its host. */
function handleOf(url: URL): string {
  const handle = url.pathname.split("/").filter(Boolean).at(-1) ?? "";
  if (/^[\w.-]{2,}$/.test(handle) && !handle.includes(".php")) {
    return url.hostname.includes("instagram") ? `@${handle}` : handle;
  }
  return url.hostname.replace(/^www\./, "");
}

/** Saved values as links. A blank or unusable value is left out rather than shown broken. */
export function toContactDetails(values: Partial<Record<string, string>>): ContactDetails {
  return {
    email: mailLink(values.contact_email ?? ""),
    phone: phoneLink(values.contact_phone ?? ""),
    socials: (Object.keys(SOCIAL_KEYS) as SocialNetwork[]).flatMap((network) => {
      const link = socialLink(network, values[SOCIAL_KEYS[network]] ?? "");
      return link ? [{ network, ...link }] : [];
    }),
  };
}

/** Until the group is saved for the first time. */
export const CONTACT_DEFAULTS: ContactDetails = toContactDetails({
  contact_email: "sidekick@gmail.com",
  contact_phone: "599 99 99 99",
  social_facebook: "https://www.facebook.com/Sidekick.ge",
  social_instagram: "https://www.instagram.com/sidekickge/",
});
