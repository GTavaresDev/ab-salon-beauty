import { defineConfig } from "vitest/config";
import unit from "./vitest.config.mjs";

export default defineConfig({
  ...unit,
  test: { environment: "node", include: ["test/**/*.integration.test.ts"] },
});
