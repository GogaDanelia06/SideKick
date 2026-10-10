import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "prisma/config";

const envFile = path.join(process.cwd(), ".env");
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

export default defineConfig({
  schema: path.join("prisma", "schema"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
