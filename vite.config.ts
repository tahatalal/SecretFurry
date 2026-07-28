import process from "node:process";
import { defineConfig } from "vitest/config";

const port = Number(process.env.PORT) || undefined;

export default defineConfig({
  // Relative base so the build works from a subpath (GitHub Pages) and from file://
  base: "./",
  server: {
    port,
    strictPort: false,
  },
  build: {
    target: "es2022",
    outDir: "dist",
    // Fonts are the only assets; keep them as files rather than base64 so the
    // stylesheet stays small and the browser can cache them separately.
    assetsInlineLimit: 0,
  },
  test: {
    // e2e/ belongs to Playwright; vitest choking on test() from another runner
    // is otherwise the first thing you hit.
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
