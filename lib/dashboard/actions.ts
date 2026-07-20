"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getContext } from "@/lib/session";
import { DASH } from "./routes";

/** Connect/disconnect a channel record (no real OAuth — that's the unbought module). */
export async function setChannelConnected(channelId: string, connected: boolean) {
  const ctx = await getContext();
  if (!ctx) return;
  await prisma.channel.updateMany({
    where: { id: channelId, businessId: ctx.businessId },
    data: {
      connected,
      status: connected ? "ACTIVE" : "OFF",
      lastSyncAt: connected ? new Date() : null,
    },
  });
  revalidatePath(DASH.channels);
}

export async function saveAiConfig(data: FormData) {
  const ctx = await getContext();
  if (!ctx) return;
  const s = (k: string) => (data.get(k) as string) || null;
  const fields = {
    style: s("style"),
    length: s("length"),
    emoji: s("emoji"),
    addressForm: s("addressForm"),
    prompt: s("prompt"),
    roles: data.getAll("roles").map(String),
  };
  await prisma.aiConfig.upsert({
    where: { businessId: ctx.businessId },
    update: fields,
    create: { businessId: ctx.businessId, languages: ["ქართული"], ...fields },
  });
  revalidatePath(DASH.ai);
}

const num = (data: FormData, k: string) => {
  const v = data.get(k);
  return v ? Number(v) : null;
};
const str = (data: FormData, k: string) => ((data.get(k) as string) || "").trim() || null;

export async function createProduct(data: FormData) {
  const ctx = await getContext();
  if (!ctx) return;
  const name = str(data, "name");
  const code = str(data, "code");
  if (!name || !code) return;
  await prisma.product.create({
    data: {
      businessId: ctx.businessId, name, code,
      price: num(data, "price") ?? 0, discountPct: num(data, "discountPct"), salePrice: num(data, "salePrice"),
      size: str(data, "size"), description: str(data, "description"), quantity: num(data, "quantity") ?? 0,
    },
  });
  revalidatePath(DASH.products);
}

export async function updateProduct(id: string, data: FormData) {
  const ctx = await getContext();
  if (!ctx) return;
  await prisma.product.updateMany({
    where: { id, businessId: ctx.businessId },
    data: {
      name: str(data, "name") ?? undefined, price: num(data, "price") ?? undefined,
      discountPct: num(data, "discountPct"), salePrice: num(data, "salePrice"),
      size: str(data, "size"), description: str(data, "description"), quantity: num(data, "quantity") ?? undefined,
    },
  });
  revalidatePath(DASH.products);
}

export async function deleteProduct(id: string) {
  const ctx = await getContext();
  if (!ctx) return;
  await prisma.product.deleteMany({ where: { id, businessId: ctx.businessId } });
  revalidatePath(DASH.products);
}

export async function saveProfile(data: FormData) {
  const ctx = await getContext();
  if (!ctx) return;
  const s = (k: string) => (data.get(k) as string) || null;
  await prisma.user.update({
    where: { id: ctx.userId },
    data: { name: s("name"), phone: s("phone") },
  });
  await prisma.business.update({
    where: { id: ctx.businessId },
    data: { name: s("company") ?? undefined, field: s("field"), description: s("description") },
  });
  revalidatePath(DASH.profile);
}
