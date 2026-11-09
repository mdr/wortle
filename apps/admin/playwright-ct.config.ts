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
process.env.WORTLE_ADMIN_CT_PORT ??= String(await findFreePort())
const ctPort = Number(process.env.WORTLE_ADMIN_CT_PORT)
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
    ctPort,
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
