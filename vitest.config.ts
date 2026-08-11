import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    // Anywhere a test file can sensibly live, so none is collected by nothing
    // and passes by never running — worse than having no test at all. Both
    // `app/` and `hooks/` were added after a test sat there silently ignored.
    include: ["{lib,app,hooks,components}/**/*.test.{ts,tsx}"],
    globals: true,
  },
});
