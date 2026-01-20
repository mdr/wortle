import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import { visualizer } from "rollup-plugin-visualizer"
import path from "path"

const analyze = process.env.ANALYZE === "true"

export default defineConfig({
  plugins: [
    tanstackRouter({ routesDirectory: "./src/routes" }),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", {}]],
      },
    }),
    analyze &&
      visualizer({
        filename: "dist/stats.html",
        template: "treemap",
        gzipSize: true,
        brotliSize: true,
      }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: true,
    allowedHosts: [".ngrok-free.app"],
  },
  base: "/",
  test: {
    setupFiles: ["./src/tests/vitest.setup.ts"],
    coverage: {
      provider: "custom",
      customProviderModule: "vitest-monocart-coverage",
      exclude: ["src/components/shadcn/**"],
    },
  },
})
