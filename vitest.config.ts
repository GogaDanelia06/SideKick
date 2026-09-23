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
    // next-auth imports "next/server" without its ".js", which Node's own loader refuses;
    // run through Vite instead, it resolves like the Next build does (lib/auth/idleSignOut.test.ts).
    server: { deps: { inline: ["next-auth"] } },
  },
});
