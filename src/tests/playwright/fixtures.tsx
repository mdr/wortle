import type { MountResult } from "@playwright/experimental-ct-react"
import { expect, test as ctBase } from "@playwright/experimental-ct-react"
import { addCoverageReport } from "monocart-reporter"

import { TestPuzzles } from "@/lib/testConstants.testUtils"
import { Iso8601Date } from "@/utils/brandedTypes"

import { NetworkSimulator } from "./NetworkSimulator.testUtils"
import { ErrorPageObject } from "./pageObjects/ErrorPageObject"
import { HistoryPageObject } from "./pageObjects/HistoryPageObject"
import { HomePageObject } from "./pageObjects/HomePageObject"
import { LoadingPageObject } from "./pageObjects/LoadingPageObject"
import { NotFoundPageObject } from "./pageObjects/NotFoundPageObject"
import { PuzzlePageObject } from "./pageObjects/PuzzlePageObject"
import { TestApp } from "./TestApp"

interface MountFunction {
  (component: React.ReactElement): Promise<MountResult>
}

const launchApp = async (mount: MountFunction, initialPath = "/"): Promise<MountResult> => {
  return await mount(<TestApp initialPath={initialPath} />)
}

interface LaunchHomePageOptions {
  today?: Iso8601Date
}

class Launcher {
  constructor(private readonly mount: MountFunction) {}

  launchExpectingLoaderPage = async (): Promise<LoadingPageObject> => {
    const mountResult = await launchApp(this.mount)
    return new LoadingPageObject(mountResult).verifyIsShown()
  }

  launchHomePage = async (options?: LaunchHomePageOptions): Promise<HomePageObject> => {
    const mountResult = await launchApp(this.mount)
    const homePage = await new HomePageObject(mountResult).verifyIsShown()
    if (options?.today) {
      await homePage.setClockDate(options.today)
    }
    return homePage
  }

  launchReviewPage = async (puzzleId: number): Promise<PuzzlePageObject> => {
    const mountResult = await launchApp(this.mount, `/review/${puzzleId}`)
    return new PuzzlePageObject(mountResult).verifyIsShown()
  }

  launchArchivePage = async (date: string): Promise<PuzzlePageObject> => {
    const mountResult = await launchApp(this.mount, `/archive/${date}`)
    return new PuzzlePageObject(mountResult).verifyIsShown()
  }

  launchArchivePageWithInvalidDate = async (date: string): Promise<HistoryPageObject> => {
    const mountResult = await launchApp(this.mount, `/archive/${date}`)
    return new HistoryPageObject(mountResult).verifyIsShown()
  }

  launchHistoryPage = async (): Promise<HistoryPageObject> => {
    const mountResult = await launchApp(this.mount, "/history")
    return new HistoryPageObject(mountResult).verifyIsShown()
  }
}

const collectCoverage = !!process.env.COVERAGE

interface Fixtures {
  launcher: Launcher
  homePage: HomePageObject
  notFoundPage: NotFoundPageObject
  errorPage: ErrorPageObject
  archivePage: PuzzlePageObject
  historyPage: HistoryPageObject
  coverageFixture: undefined
  networkSimulator: NetworkSimulator
}

export const test = ctBase.extend<Fixtures>({
  coverageFixture: [
    async ({ page }, use, testInfo) => {
      if (collectCoverage) {
        await page.coverage.startJSCoverage({ resetOnNavigation: false })
      }
      await use(undefined)
      if (collectCoverage) {
        const coverage = await page.coverage.stopJSCoverage()
        await addCoverageReport(coverage, testInfo)
      }
    },
    { auto: true },
  ],
  networkSimulator: [
    async ({ page }, use) => {
      const simulator = new NetworkSimulator(page)
      await simulator.install()
      await use(simulator)
    },
    { auto: true },
  ],
  // eslint-disable-next-line @typescript-eslint/unbound-method
  launcher: async ({ mount }, use) => {
    await use(new Launcher(mount))
  },
  // eslint-disable-next-line @typescript-eslint/unbound-method
  homePage: async ({ mount }, use) => {
    const mountResult = await launchApp(mount)
    const homePage = await new HomePageObject(mountResult).verifyIsShown()
    await use(homePage)
  },
  // eslint-disable-next-line @typescript-eslint/unbound-method
  notFoundPage: async ({ mount }, use) => {
    const mountResult = await launchApp(mount, "/non-existent-page")
    const notFoundPage = await new NotFoundPageObject(mountResult).verifyIsShown()
    await use(notFoundPage)
  },
  // eslint-disable-next-line @typescript-eslint/unbound-method
  errorPage: async ({ mount }, use) => {
    const mountResult = await launchApp(mount, "/error-test")
    const errorPage = await new ErrorPageObject(mountResult).verifyIsShown()
    await use(errorPage)
  },
  // eslint-disable-next-line @typescript-eslint/unbound-method
  archivePage: async ({ mount }, use) => {
    const mountResult = await launchApp(mount, `/archive/${TestPuzzles.devilsBitScabious.scheduledDate}`)
    const archivePage = await new PuzzlePageObject(mountResult).verifyIsShown()
    await use(archivePage)
  },
  // eslint-disable-next-line @typescript-eslint/unbound-method
  historyPage: async ({ mount }, use) => {
    const mountResult = await launchApp(mount, "/history")
    const historyPage = await new HistoryPageObject(mountResult).verifyIsShown()
    await use(historyPage)
  },
})

export { expect }
