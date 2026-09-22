import { fixupConfigRules } from "@eslint/compat";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  // eslint-plugin-react, -import and -jsx-a11y (inside eslint-config-next) still call context
  // methods ESLint 10 removed; @eslint/compat puts them back until those plugins catch up.
  ...fixupConfigRules([...nextVitals, ...nextTs]),
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
