import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Third-party design skill (scripts and assets for the coding assistant), not app code.
    ".claude/**",
    // Deliberately broken code that the architecture test (ARCH-001) must reject.
    "src/architecture/fixtures/**",
  ]),
]);

export default eslintConfig;
