import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "prisma/config";

/**
 * Prisma's own configuration, moved out of package.json.
 *
 * The `prisma` key in package.json still works but is deprecated and goes away
 * in Prisma 7, which the CLI said on every command.
 */

/**
 * Loading `.env` is now our job.
 *
 * The moment a config file exists Prisma stops reading `.env` itself — it says
 * so on startup, and every CLI command that needs a connection string starts
 * failing validation. `prisma generate` survives because it never opens the
 * database, which is exactly why the breakage is easy to ship: the command run
 * on every install keeps working while `migrate`, `db seed` and `migrate reset`
 * do not.
 *
 * Guarded, because there is no `.env` on Vercel — the variables are already in
 * the environment there, and reading a missing file would throw during build.
 */
const envFile = path.join(process.cwd(), ".env");
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

export default defineConfig({
  // A folder, not a file: the schema is split across prisma/schema/*.prisma.
  schema: path.join("prisma", "schema"),
  migrations: {
    // Used by `pnpm db:seed` and by `prisma migrate reset`.
    seed: "tsx prisma/seed.ts",
  },
});
