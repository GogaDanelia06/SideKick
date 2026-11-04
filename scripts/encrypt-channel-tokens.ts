import { prisma } from "../lib/db";
import { isSealed, openToken, sealToken } from "../lib/security/tokenCipher";

// Seals the channel access tokens stored before TOKEN_ENCRYPTION_KEY existed.
// Run with the same key as production; without --fix it only counts.
async function main() {
  const fix = process.argv.includes("--fix");
  if (!process.env.TOKEN_ENCRYPTION_KEY) {
    console.error("Set TOKEN_ENCRYPTION_KEY to the production value first.");
    process.exit(1);
  }

  const rows = await prisma.channel.findMany({
    where: { accessToken: { not: null } },
    select: { id: true, type: true, businessId: true, accessToken: true },
  });
  const plain = rows.filter((r) => r.accessToken && !isSealed(r.accessToken));
  console.log(`${rows.length} channel(s) hold a token, ${plain.length} still unencrypted.`);
  if (!fix || plain.length === 0) {
    if (plain.length) console.log("Re-run with --fix to encrypt them.");
    return;
  }

  let sealed = 0;
  for (const row of plain) {
    const token = row.accessToken!;
    const next = sealToken(token);
    if (!isSealed(next) || openToken(next) !== token) {
      console.error(`  ${row.type} ${row.id}: the key did not round-trip, left as it was`);
      continue;
    }
    const { count } = await prisma.channel.updateMany({
      where: { id: row.id, accessToken: token },
      data: { accessToken: next },
    });
    sealed += count;
  }
  console.log(`Encrypted ${sealed} of ${plain.length}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
