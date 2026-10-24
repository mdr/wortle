import { defineConfig } from "vitest/config"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import babel from "@rolldown/plugin-babel"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import { visualizer } from "rollup-plugin-visualizer"
import path from "path"

const analyze = process.env.ANALYZE === "true"

export default defineConfig({
  plugins: [
    tanstackRouter({ routesDirectory: "./src/routes" }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
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
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  server: {
    host: true,
    allowedHosts: [".ngrok-free.app"],
  },
  base: "/",
  test: {
    setupFiles: ["./src/tests/vitest.setup.ts"],
    env: {
      LC_ALL: "en_GB.UTF-8",
      TZ: "UTC",
    },
    coverage: {
      provider: "custom",
      customProviderModule: "vitest-monocart-coverage",
      exclude: ["src/components/shadcn/**"],
    },
  },
})
