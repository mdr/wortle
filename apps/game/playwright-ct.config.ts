import { defineConfig, devices } from "@playwright/experimental-ct-react"
import { createServer } from "net"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const findFreePort = () =>
  new Promise<number>((resolve, reject) => {
    const server = createServer()
    server.on("error", reject)
    server.listen(0, () => {
      const address = server.address()
      server.close(() =>
        address && typeof address === "object" ? resolve(address.port) : reject(new Error("No port")),
      )
    })
  })

// Picked once by the main process, then inherited by the workers (which re-load this config),
// so parallel runs in other worktrees, or a fixed-port server already running, never collide.
process.env.WORTLE_GAME_CT_PORT ??= String(await findFreePort())
const ctPort = Number(process.env.WORTLE_GAME_CT_PORT)
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
    ctPort,
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
