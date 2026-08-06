import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    // `app/` is included so route handlers can be tested next to the route they
    // belong to. Without it such a file is collected by nothing and passes by
    // never running, which is worse than having no test at all.
    include: ["lib/**/*.test.ts", "app/**/*.test.ts"],
    globals: true,
  },
});
