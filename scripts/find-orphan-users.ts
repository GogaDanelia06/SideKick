import { prisma } from "../lib/db";
import { provisionBusiness } from "../lib/provision";

/**
 * Finds accounts that can sign in but belong to no business.
 *
 * These are a dead end rather than a broken page: the password is accepted, the
 * session is issued, and then every dashboard route bounces to /login because
 * `getContext` has no membership to run as. Registering again does not help —
 * the address is already taken — so the person is locked out with no error
 * message to go on.
 *
 * They exist because registration created the user and the business as two
 * separate writes. That is fixed; this is for the rows left behind.
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
    // Whether they can sign in at all decides how urgent it is: an account with
    // no password was never usable, one with a password is a person locked out.
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
