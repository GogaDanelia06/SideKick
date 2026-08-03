import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticate, isDenial } from "@/lib/agent/auth";
import { effectivePrice } from "@/lib/agent/pricing";

export const dynamic = "force-dynamic";

/** Products per response — enough for a catalogue, small enough to stay fast. */
const PRODUCT_LIMIT = 500;

/**
 * Everything the model needs to answer one tenant's customer.
 *
 * The tone settings, the tenant's own prompt, and the catalogue with prices
 * already worked out — so the AI quotes the same figure the order endpoint will
 * charge, rather than deriving it from `price` and `discountPct` itself.
 *
 * A GET, so `businessId` comes from the query string rather than a body.
 */
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
    // Null means the tenant has not configured their assistant yet, which the
    // AI service should treat as "use your defaults", not as an error.
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
