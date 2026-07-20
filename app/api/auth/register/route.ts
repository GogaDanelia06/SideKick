import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { provisionBusiness } from "@/lib/provision";
import { registerSchema } from "@/lib/validation/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { firstName, lastName, email, password, phone, company, field } = parsed.data;
  const normEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normEmail } });
  if (existing) {
    return NextResponse.json({ error: "ეს მეილი უკვე რეგისტრირებულია" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email: normEmail,
      name: `${firstName} ${lastName}`.trim(),
      passwordHash,
      phone,
      // Auto-verified for now — swap for an emailed link when a mail provider is added.
      emailVerified: new Date(),
    },
  });

  await provisionBusiness(user.id, company || `${firstName}'s business`, field);
  return NextResponse.json({ ok: true });
}
