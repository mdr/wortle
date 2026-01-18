import type { MountResult } from "@playwright/experimental-ct-react"
import { expect, test as ctBase } from "@playwright/experimental-ct-react"

import { TestPuzzles } from "@/lib/testConstants.testUtils"

import { ErrorPageObject } from "./pageObjects/ErrorPageObject"
import { HistoryPageObject } from "./pageObjects/HistoryPageObject"
import { HomePageObject } from "./pageObjects/HomePageObject"
import { NotFoundPageObject } from "./pageObjects/NotFoundPageObject"
import { PuzzlePageObject } from "./pageObjects/PuzzlePageObject"
import { TestApp } from "./TestApp"

interface MountFunction {
  (component: React.ReactElement): Promise<MountResult>
}

const launchApp = async (mount: MountFunction, initialPath = "/"): Promise<MountResult> => {
  return await mount(<TestApp initialPath={initialPath} />)
}

class Launcher {
  constructor(private readonly mount: MountFunction) {}

  launchHomePage = async (): Promise<HomePageObject> => {
    const mountResult = await launchApp(this.mount)
    return new HomePageObject(mountResult).verifyIsShown()
  }

  launchReviewPage = async (puzzleId: number): Promise<PuzzlePageObject> => {
    const mountResult = await launchApp(this.mount, `/review/${puzzleId}`)
    return new PuzzlePageObject(mountResult).verifyIsShown()
  }

  launchArchivePage = async (date: string): Promise<PuzzlePageObject> => {
    const mountResult = await launchApp(this.mount, `/archive/${date}`)
    return new PuzzlePageObject(mountResult).verifyIsShown()
  }

  launchHistoryPage = async (): Promise<HistoryPageObject> => {
    const mountResult = await launchApp(this.mount, "/history")
    return new HistoryPageObject(mountResult).verifyIsShown()
  }
}

interface Fixtures {
  launcher: Launcher
  homePage: HomePageObject
  notFoundPage: NotFoundPageObject
  errorPage: ErrorPageObject
  archivePage: PuzzlePageObject
  historyPage: HistoryPageObject
}

export const test = ctBase.extend<Fixtures>({
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
