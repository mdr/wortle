import type { Page, Route } from "@playwright/test"

const isLocal = (url: URL) => url.hostname === "localhost" || url.hostname === "127.0.0.1"

// Fails the test on any request beyond localhost, so IWFTs never touch the internet. Add a
// stand-in route here (registered after the catch-all) if a tested page needs an outside resource.
export class OfflineWorld {
  private readonly outsideRequests: string[] = []

  constructor(private readonly page: Page) {}

  install = async () => {
    await this.page.route((url) => !isLocal(url), this.refuse)
  }

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
