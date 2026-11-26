import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    environment: "node",
    include: ["core/**/*.integration.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 120_000,
    pool: "forks",
    maxWorkers: 1,
    isolate: true,
  },
  resolve: {
    alias: {
      "@core": path.resolve(import.meta.dirname, "core"),
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
});
