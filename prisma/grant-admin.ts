import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2]?.toLowerCase().trim();
  const revoke = process.argv.includes("--revoke");

  if (!email || email.startsWith("--")) {
    console.error("Usage: pnpm admin:grant <email> [--revoke]");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`✗ No user with email "${email}". Register them on the site first.`);
    process.exit(1);
  }

  await prisma.user.update({ where: { email }, data: { isAdmin: !revoke } });

  console.log(
    revoke
      ? `✓ Revoked platform-admin from ${email}. They lose /admin access on their next request.`
      : `✓ ${email} is now a platform admin. They must sign out and back in for the nav link to appear (or just visit /admin).`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
