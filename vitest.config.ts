import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // tsconfig's "@/*": ["./*"]. Only "@/", so packages like "@prisma/client" are untouched.
    alias: [{ find: /^@\//, replacement: fileURLToPath(new URL("./", import.meta.url)) }],
  },
  test: {
    environment: "node",
    include: ["{lib,app,hooks,components}/**/*.test.{ts,tsx}"],
    globals: true,
  },
});
