import { prisma } from "../lib/db";
import { isSealed, openToken, sealToken } from "../lib/security/tokenCipher";

async function main() {
  const fix = process.argv.includes("--fix");
  if (!process.env.TOKEN_ENCRYPTION_KEY) {
    console.error("Set TOKEN_ENCRYPTION_KEY to the production value first.");
    process.exit(1);
  }

  const [{ role, canWrite }] = await prisma.$queryRaw<{ role: string; canWrite: boolean }[]>`
    SELECT current_user AS role, has_table_privilege(current_user, '"Channel"', 'UPDATE') AS "canWrite"`;
  console.log(`Connected as ${role}${canWrite ? "" : " (read-only on Channel)"}.`);
  if (fix && !canWrite) {
    console.error("This user may not change channels. Use the owner's connection string (usually neondb_owner).");
    process.exit(1);
  }

  const rows = await prisma.channel.findMany({
    where: { accessToken: { not: null } },
    select: { id: true, type: true, businessId: true, accessToken: true },
  });
  const plain = rows.flatMap(({ accessToken, ...row }) =>
    accessToken && !isSealed(accessToken) ? [{ ...row, token: accessToken }] : [],
  );
  console.log(`${rows.length} channel(s) hold a token, ${plain.length} still unencrypted.`);
  if (!fix || plain.length === 0) {
    if (plain.length) console.log("Re-run with --fix to encrypt them.");
    return;
  }

  let sealed = 0;
  for (const row of plain) {
    const { token } = row;
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
