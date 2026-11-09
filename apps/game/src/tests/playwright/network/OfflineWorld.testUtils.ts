import type { Page, Route } from "@playwright/test"
import { createRequire } from "module"
import path from "path"
import { fileURLToPath } from "url"

const OFFLINE_WORLD_DIR = fileURLToPath(new URL("../offlineWorld/", import.meta.url))
const PUZZLE_PHOTO = path.join(OFFLINE_WORLD_DIR, "puzzle-photo.webp")
const WORLD_ATLAS = createRequire(import.meta.url).resolve("world-atlas/countries-50m.json")

const isLocal = (url: URL) => url.hostname === "localhost" || url.hostname === "127.0.0.1"

// Answers every request beyond localhost from checked-in stand-ins, so IWFTs never touch the
// internet (production images, analytics, CDNs). Any other outside request fails the test.
export class OfflineWorld {
  private readonly outsideRequests: string[] = []

  constructor(private readonly page: Page) {}

  install = async () => {
    // Registered first so it has the lowest precedence: Playwright tries the most recent route first.
    await this.page.route((url) => !isLocal(url), this.refuse)

    await this.page.route(
      (url) => /^images(-dev)?\.wortle\.app$/.test(url.hostname),
      (route) => route.fulfill({ path: PUZZLE_PHOTO }),
    )
    await this.page.route("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json", (route) =>
      route.fulfill({ path: WORLD_ATLAS }),
    )
    await this.page.route("https://mirrors.creativecommons.org/presskit/icons/*.svg", (route) =>
      route.fulfill({
        path: path.join(OFFLINE_WORLD_DIR, `cc-${path.basename(new URL(route.request().url()).pathname)}`),
      }),
    )
    // An empty tracker: no analytics events are sent, and the app's useUmami calls are no-ops.
    await this.page.route("https://cloud.umami.is/script.js", (route) =>
      route.fulfill({ contentType: "text/javascript", body: "" }),
    )
  }

  // Answers an outside URL with a stand-in. Always takes precedence over the catch-all.
  serve = (url: string, handler: (route: Route) => Promise<void>) => this.page.route(url, handler)

  verifyNoOutsideRequests = () => {
    if (this.outsideRequests.length > 0) {
      throw new Error(
        `Requests left localhost with no offline stand-in:\n${this.outsideRequests.join("\n")}\n` +
          "Add a stand-in in src/tests/playwright/network/OfflineWorld.testUtils.ts.",
      )
    }
  }

  private readonly refuse = async (route: Route) => {
    this.outsideRequests.push(`${route.request().method()} ${route.request().url()}`)
    await route.abort("blockedbyclient")
  }
}
