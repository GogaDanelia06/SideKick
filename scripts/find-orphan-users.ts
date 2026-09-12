import { prisma } from "../lib/db";
import { provisionBusiness } from "../lib/provision";

/**
 * Finds users without a business (left by an old non-transactional registration).
 * They can sign in, but every dashboard route redirects them to /login.
 *
 *   npx tsx scripts/find-orphan-users.ts          # list them
 *   npx tsx scripts/find-orphan-users.ts --fix    # give each one a business
 */

async function main() {
  const fix = process.argv.includes("--fix");

  const orphans = await prisma.user.findMany({
    where: { memberships: { none: {} } },
    select: { id: true, email: true, name: true, createdAt: true, passwordHash: true },
    orderBy: { createdAt: "asc" },
  });

  if (orphans.length === 0) {
    console.log("No orphaned accounts — every user belongs to a business.");
    return;
  }

  console.log(`${orphans.length} account(s) with no business:\n`);
  for (const u of orphans) {
    const canSignIn = u.passwordHash ? "can sign in — locked out" : "no password set";
    console.log(`  ${u.email}  (${u.createdAt.toISOString().slice(0, 10)}, ${canSignIn})`);
  }

  if (!fix) {
    console.log(`\nRe-run with --fix to give each one a business of their own.`);
    return;
  }

  for (const u of orphans) {
    const name = u.name?.trim() || u.email.split("@")[0];
    await provisionBusiness(u.id, `${name}'s business`);
    console.log(`  provisioned a business for ${u.email}`);
  }

  console.log(`\nRepaired ${orphans.length} account(s). They can sign in now.`);
}

void main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
