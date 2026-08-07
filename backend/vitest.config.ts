import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    globalSetup: ["test/global-setup.ts"],
    hookTimeout: 30000,
    testTimeout: 20000,
  },
});
