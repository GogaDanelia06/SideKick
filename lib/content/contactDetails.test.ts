import { describe, it, expect } from "vitest";
import { CONTACT_DEFAULTS, mailLink, phoneLink, socialLink, toContactDetails } from "./contactDetails";

describe("mailLink()", () => {
  it("links an address, and refuses anything that is not one", () => {
    expect(mailLink(" info@sidekick.ge ")).toEqual({ value: "info@sidekick.ge", href: "mailto:info@sidekick.ge" });
    expect(mailLink("info@sidekick")).toBeNull();
    expect(mailLink("")).toBeNull();
  });
});

describe("phoneLink()", () => {
  it("keeps the number as written and dials it internationally", () => {
    expect(phoneLink("599 99 99 99")).toEqual({ value: "599 99 99 99", href: "tel:+995599999999" });
    expect(phoneLink("+995 32 2 00 00 00")).toEqual({ value: "+995 32 2 00 00 00", href: "tel:+995322000000" });
    expect(phoneLink("(032) 200-000")).toEqual({ value: "(032) 200-000", href: "tel:032200000" });
  });

  it("refuses a phone with nothing to dial", () => {
    expect(phoneLink("")).toBeNull();
    expect(phoneLink("—")).toBeNull();
  });
});

describe("socialLink()", () => {
  it("takes a profile however it was pasted, and shows its handle", () => {
    expect(socialLink("instagram", "https://www.instagram.com/sidekickge/")).toEqual({
      value: "@sidekickge",
      href: "https://www.instagram.com/sidekickge/",
    });
    expect(socialLink("facebook", "facebook.com/Sidekick.ge")).toEqual({
      value: "Sidekick.ge",
      href: "https://facebook.com/Sidekick.ge",
    });
  });

  it("names the site when the address has no clean handle", () => {
    expect(socialLink("facebook", "https://www.facebook.com/profile.php?id=61593216080369")?.value).toBe("facebook.com");
  });

  it("turns a WhatsApp number into a chat link", () => {
    expect(socialLink("whatsapp", "+995 599 99 99 99")).toEqual({
      value: "+995 599 99 99 99",
      href: "https://wa.me/995599999999",
    });
  });

  it("never links anywhere but the web", () => {
    expect(socialLink("linkedin", "javascript:alert(1)")).toBeNull();
    expect(socialLink("facebook", "   ")).toBeNull();
  });
});

describe("toContactDetails()", () => {
  /** The bug this closes: the panel saved these, and the site never read them. */
  it("shows what was saved, and leaves out what was left blank", () => {
    const details = toContactDetails({
      contact_email: "info@sidekick.ge",
      contact_phone: "",
      social_facebook: "https://www.facebook.com/Sidekick.ge",
      social_whatsapp: "",
    });
    expect(details.email?.value).toBe("info@sidekick.ge");
    expect(details.phone).toBeNull();
    expect(details.socials.map((s) => s.network)).toEqual(["facebook"]);
  });

  it("starts from the company's own details before anything is saved", () => {
    expect(CONTACT_DEFAULTS.email?.value).toBe("sidekick@gmail.com");
    expect(CONTACT_DEFAULTS.socials.map((s) => s.network)).toEqual(["facebook", "instagram"]);
  });
});
