import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticate, isDenial } from "@/lib/agent/auth";
import { effectivePrice } from "@/lib/agent/pricing";

export const dynamic = "force-dynamic";

const PRODUCT_LIMIT = 500;

/** Everything the AI needs to answer for one business, with final product prices. */
export async function GET(request: Request) {
  const businessId = new URL(request.url).searchParams.get("businessId");

  const auth = await authenticate(request, businessId);
  if (isDenial(auth)) return auth.response;

  const [business, config, products] = await Promise.all([
    prisma.business.findUnique({
      where: { id: auth.businessId },
      select: { name: true, field: true },
    }),
    prisma.aiConfig.findUnique({
      where: { businessId: auth.businessId },
      select: {
        languages: true,
        style: true,
        length: true,
        emoji: true,
        addressForm: true,
        roles: true,
        handoffRule: true,
        leadEnabled: true,
        leadRule: true,
        orderEnabled: true,
        orderRule: true,
        faqText: true,
        policies: true,
        prompt: true,
        replyDelaySec: true,
      },
    }),
    prisma.product.findMany({
      where: { businessId: auth.businessId },
      orderBy: { createdAt: "desc" },
      take: PRODUCT_LIMIT,
      select: {
        code: true,
        name: true,
        description: true,
        size: true,
        price: true,
        salePrice: true,
        quantity: true,
      },
    }),
  ]);

  return NextResponse.json({
    business,
    // Null until the assistant is configured; the AI service then uses its defaults.
    config,
    products: products.map((p) => ({
      code: p.code,
      name: p.name,
      description: p.description,
      size: p.size,
      price: effectivePrice(p),
      listPrice: p.price,
      inStock: p.quantity > 0,
      quantity: p.quantity,
    })),
  });
}
