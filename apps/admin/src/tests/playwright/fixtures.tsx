import type { MountResult } from "@playwright/experimental-ct-react"
import { expect, test as ctBase } from "@playwright/experimental-ct-react"

import { BrowserErrors } from "./BrowserErrors.testUtils"
import { OfflineWorld } from "./network/OfflineWorld.testUtils"
import { TrpcSimulator } from "./network/TrpcSimulator.testUtils"
import { TaxaListPageObject } from "./pageObjects/TaxaListPageObject"
import { TestApp } from "./TestApp"

type MountFunction = (component: React.ReactElement) => Promise<MountResult>

class Launcher {
  constructor(private readonly mount: MountFunction) {}

  launchTaxaListPage = async (): Promise<TaxaListPageObject> => {
    const mountResult = await this.mount(<TestApp initialPath="/taxa" />)
    return new TaxaListPageObject(mountResult).verifyIsShown()
  }
}

interface Fixtures {
  browserErrors: BrowserErrors
  offlineWorld: OfflineWorld
  trpcSimulator: TrpcSimulator
  launcher: Launcher
}

export const test = ctBase.extend<Fixtures>({
  browserErrors: [
    async ({ page }, use) => {
      const browserErrors = new BrowserErrors(page)
      await use(browserErrors)
      browserErrors.verifyNoUnexpectedErrors()
    },
    { auto: true },
  ],
  offlineWorld: [
    async ({ page }, use) => {
      const offlineWorld = new OfflineWorld(page)
      await offlineWorld.install()
      await use(offlineWorld)
      offlineWorld.verifyNoOutsideRequests()
    },
    { auto: true },
  ],
  trpcSimulator: [
    async ({ page }, use) => {
      const simulator = new TrpcSimulator(page)
      await simulator.install()
      await use(simulator)
    },
    { auto: true },
  ],
  launcher: async ({ mount }, use) => {
    await use(new Launcher(mount))
  },
})

export { expect }
