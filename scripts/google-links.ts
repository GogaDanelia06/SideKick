import { prisma } from "../lib/db";

function googleEmail(idToken: string | null): string | null {
  try {
    const payload = idToken?.split(".")[1];
    const claims = payload ? JSON.parse(Buffer.from(payload, "base64url").toString()) : null;
    return typeof claims?.email === "string" ? claims.email.toLowerCase() : null;
  } catch {
    return null;
  }
}

async function main() {
  const flag = process.argv.indexOf("--unlink");
  const wanted = flag === -1 ? null : process.argv[flag + 1]?.toLowerCase().trim();
  if (flag !== -1 && !wanted) {
    console.error("Say which address to unlink: --unlink someone@gmail.com");
    process.exitCode = 1;
    return;
  }

  const links = await prisma.account.findMany({
    where: { provider: "google" },
    select: {
      id: true,
      providerAccountId: true,
      id_token: true,
      user: { select: { id: true, email: true, name: true } },
    },
  });

  if (links.length === 0) {
    console.log("No Google account is linked to anyone.");
    return;
  }

  const rows = links.map((link) => {
    const google = googleEmail(link.id_token);
    return { ...link, google, mismatched: Boolean(google && google !== link.user.email?.toLowerCase()) };
  });

  console.log(`${rows.length} Google link${rows.length === 1 ? "" : "s"}:\n`);
  for (const row of rows) {
    const mark = row.mismatched ? "  ← opens a different account" : "";
    console.log(`  ${row.google ?? `google id ${row.providerAccountId}`}  →  ${row.user.email} (${row.user.name ?? "no name"})${mark}`);
  }

  const wrong = rows.filter((row) => row.mismatched);
  if (wrong.length > 0 && !wanted) {
    console.log(`\n${wrong.length} link${wrong.length === 1 ? " opens" : "s open"} an account with another address.`);
    console.log(`Unlink one with:  npx tsx scripts/google-links.ts --unlink ${wrong[0].google}`);
  }
  if (!wanted) return;

  const doomed = rows.filter((row) => row.google === wanted || row.user.email?.toLowerCase() === wanted);
  if (doomed.length === 0) {
    console.log(`\nNothing to unlink: no Google link for ${wanted}.`);
    return;
  }

  const { count } = await prisma.account.deleteMany({ where: { id: { in: doomed.map((row) => row.id) } } });
  console.log(`\nUnlinked ${count}: ${doomed.map((row) => `${row.google ?? row.providerAccountId} → ${row.user.email}`).join(", ")}`);
  console.log("That Google address now starts a fresh account the next time it signs in.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
