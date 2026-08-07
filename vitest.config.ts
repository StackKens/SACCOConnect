import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["app/src/**/*.test.ts"],
    environmentMatchGlobs: undefined,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./app/src"),
    },
  },
});
