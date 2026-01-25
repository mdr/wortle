import { defineConfig, devices } from "@playwright/experimental-ct-react"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const collectCoverage = !!process.env.COVERAGE

export default defineConfig({
  testDir: "./src/tests/playwright/scenarios",
  testMatch: "*.iwft.ts",
  snapshotDir: "./src/tests/playwright/snapshots",
  timeout: 10000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: collectCoverage
    ? [
        ["html"],
        [
          "monocart-reporter",
          {
            name: "IWFT Coverage Report",
            outputFile: "./coverage/iwft/report.html",
            coverage: {
              reports: [["raw", {}], ["v8"], ["console-summary"]],
              entryFilter: (entry: { url: string }) => entry.url.includes("localhost") && !entry.url.includes("umami"),
              sourceFilter: (sourcePath: string) =>
                sourcePath.startsWith("src/") &&
                !sourcePath.startsWith("src/tests/") &&
                !sourcePath.startsWith("src/components/shadcn/") &&
                !sourcePath.includes("routeTree.gen") &&
                !sourcePath.endsWith(".css") &&
                !sourcePath.includes(".stryker-tmp"),
            },
          },
        ],
      ]
    : "html",
  use: {
    trace: "on-first-retry",
    ctPort: 3100,
    ctViteConfig: {
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "src"),
        },
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
