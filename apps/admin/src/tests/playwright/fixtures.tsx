import type { MountResult } from "@playwright/experimental-ct-react"
import { expect, test as ctBase } from "@playwright/experimental-ct-react"

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
  trpcSimulator: TrpcSimulator
  launcher: Launcher
}

export const test = ctBase.extend<Fixtures>({
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
