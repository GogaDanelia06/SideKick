import { field, type Parsed } from "./fields";

export type PlanData = {
  name: string;
  nameEn: string;
  price: number;
  price3m: number | null;
  price12m: number | null;
  msgLimit: number;
  channelCap: number;
  userCap: number;
  productCap: number;
  extrasKa: string[];
  extrasEn: string[];
  featured: boolean;
};

const EXTRA_SLOTS = 5;

/** A non-negative integer, or -1 for unlimited; null when invalid. */
function cap(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n >= -1 ? n : null;
}

/** A term price: null when empty (monthly × months applies), undefined when invalid. */
function termPrice(raw: string): number | null | undefined {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 ? n : undefined;
}

export function parsePlan(fd: FormData): Parsed<PlanData> {
  const name = field(fd, "name");
  const price = Number(field(fd, "price"));
  const price3m = termPrice(field(fd, "price3m"));
  const price12m = termPrice(field(fd, "price12m"));
  const msgLimit = cap(field(fd, "msgLimit"));
  const channelCap = cap(field(fd, "channelCap"));
  const userCap = cap(field(fd, "userCap"));
  const productCap = cap(field(fd, "productCap"));

  if (!name) return { error: "name_required" };
  if (!Number.isInteger(price) || price < 0) return { error: "bad_price" };
  if (price3m === undefined || price12m === undefined) return { error: "bad_price" };
  if (msgLimit === null || channelCap === null || userCap === null || productCap === null) {
    return { error: "bad_cap" };
  }

  const extrasKa: string[] = [];
  const extrasEn: string[] = [];
  for (let i = 0; i < EXTRA_SLOTS; i++) {
    const ka = field(fd, `extraKa${i}`);
    if (!ka) continue;
    extrasKa.push(ka);
    extrasEn.push(field(fd, `extraEn${i}`) || ka);
  }

  return {
    data: {
      name,
      nameEn: field(fd, "nameEn"),
      price,
      price3m,
      price12m,
      msgLimit,
      channelCap,
      userCap,
      productCap,
      extrasKa,
      extrasEn,
      featured: fd.get("featured") === "on",
    },
  };
}
