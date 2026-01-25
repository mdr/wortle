import { HomeTestIds } from "@/components/pages/home/HomeTestIds"
import { SharedTestIds } from "@/components/shared/SharedTestIds"

import { expect } from "../fixtures"
import { AboutPageObject } from "./AboutPageObject"
import { HistoryPageObject } from "./HistoryPageObject"
import { PageObject } from "./PageObject"
import { PuzzlePageObject } from "./PuzzlePageObject"

export class HomePageObject extends PageObject {
  verifyIsShown = (): Promise<this> =>
    this.step("verifyIsShown", async () => {
      await expect(this.get(HomeTestIds.page)).toBeVisible()
      return this
    })

  verifyPuzzleCount = (count: number): Promise<void> =>
    this.step(`verifyPuzzleCount ${count}`, () => expect(this.get(HomeTestIds.puzzleLink)).toHaveCount(count))

  clickPuzzle = (index: number): Promise<PuzzlePageObject> =>
    this.step(`clickPuzzle ${index}`, async () => {
      await this.get(HomeTestIds.puzzleLink).nth(index).click()
      return new PuzzlePageObject(this.mountResult).verifyIsShown()
    })

  clickDailyPuzzle = (): Promise<PuzzlePageObject> =>
    this.step("clickDailyPuzzle", async () => {
      await this.get(HomeTestIds.dailyPuzzleLink).click()
      return new PuzzlePageObject(this.mountResult).verifyIsShown()
    })

  goToHistory = (): Promise<HistoryPageObject> =>
    this.step("goToHistory", async () => {
      await this.get(SharedTestIds.headerHistoryLink).click()
      return new HistoryPageObject(this.mountResult).verifyIsShown()
    })

  goToAbout = (): Promise<AboutPageObject> =>
    this.step("goToAbout", async () => {
      await this.get(SharedTestIds.headerAboutLink).click()
      return new AboutPageObject(this.mountResult).verifyIsShown()
    })
}
