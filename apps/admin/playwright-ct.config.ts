import { defineConfig, devices } from "@playwright/experimental-ct-react"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const shims = path.resolve(__dirname, "src/tests/playwright/nextShims")

export default defineConfig({
  testDir: "./src/tests/playwright/scenarios",
  testMatch: "*.iwft.ts",
  timeout: 10000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    trace: "on-first-retry",
    ctPort: 3102,
    ctViteConfig: {
      resolve: {
        alias: [
          { find: /^next\/link$/, replacement: path.join(shims, "link.testUtils.tsx") },
          { find: /^next\/navigation$/, replacement: path.join(shims, "navigation.testUtils.tsx") },
          { find: "@", replacement: path.resolve(__dirname, "src") },
        ],
      },
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
