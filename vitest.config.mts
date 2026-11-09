import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const alias = { "@": fileURLToPath(new URL("./src", import.meta.url)) };

export default defineConfig({
  resolve: { alias },
  test: {
    projects: [
      // Pure logic, content and document checks.
      { resolve: { alias }, test: { name: "unit", include: ["src/**/*.test.ts"] } },
      // Component and integration tests (QA-002): React components rendered in jsdom.
      { resolve: { alias }, test: { name: "component", include: ["src/**/*.test.tsx"], environment: "jsdom", setupFiles: ["src/test/setup.ts"] } },
    ],
  },
});
