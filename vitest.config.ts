import { defineConfig } from "vitest/config";
import { transformWithOxc } from "vite";
import path from "path";

export default defineConfig({
  plugins: [
    {
      name: "ts-ignore-files",
      enforce: "pre",
      async transform(code, id) {
        if (id.endsWith(".ignore")) {
          const result = await transformWithOxc(code, id, {
            lang: "ts",
            sourcemap: true,
          });
          return { code: result.code, map: result.map };
        }
      },
    },
  ],
  test: {
    environment: "node",
    include: ["app/src/**/*.test.ignore"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./app/src"),
    },
  },
});
