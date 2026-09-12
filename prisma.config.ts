import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "prisma/config";

/** With a config file Prisma stops loading .env itself; Vercel has no .env file, hence the guard. */
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
