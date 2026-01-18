import { AnswerTestIds, AttemptHistoryTestIds, PuzzleTestIds } from "@/components/puzzle/PuzzleTestIds"

import { expect } from "../fixtures"
import { GalleryPageObject } from "./GalleryPageObject"
import { HomePageObject } from "./HomePageObject"
import { PageObject } from "./PageObject"

export class PuzzlePageObject extends PageObject {
  verifyIsShown = (): Promise<this> =>
    this.step("verifyIsShown", async () => {
      await expect(this.get(PuzzleTestIds.page)).toBeVisible()
      return this
    })

  searchForPlant = (name: string): Promise<void> =>
    this.step(`searchForPlant '${name}'`, () => this.get(PuzzleTestIds.searchInput).fill(name))

  selectFirstPlantOption = (): Promise<void> =>
    this.step("selectFirstPlantOption", () => this.get(PuzzleTestIds.plantOption).first().click())

  submitAnswer = (): Promise<void> => this.step("submitAnswer", () => this.get(PuzzleTestIds.submitAnswer).click())

  chooseDifferentPlant = (): Promise<void> =>
    this.step("chooseDifferentPlant", () => this.get(PuzzleTestIds.chooseDifferentPlant).click())

  verifyCorrectAnswer = (): Promise<void> =>
    this.step("verifyCorrectAnswer", () => expect(this.get(AnswerTestIds.correct)).toBeVisible())

  verifyIncorrectAnswer = (): Promise<void> =>
    this.step("verifyIncorrectAnswer", () => expect(this.get(AnswerTestIds.incorrect)).toBeVisible())

  giveUp = (): Promise<void> => this.step("giveUp", () => this.get(PuzzleTestIds.giveUp).click())

  verifyGaveUp = (): Promise<void> =>
    this.step("verifyGaveUp", () => expect(this.get(AnswerTestIds.gaveUp)).toBeVisible())

  verifyDidNotAttempt = (): Promise<void> =>
    this.step("verifyDidNotAttempt", () => expect(this.get(AnswerTestIds.didNotAttempt)).toBeVisible())

  verifyAttemptHistory = (count: number): Promise<void> =>
    this.step(`verifyAttemptHistory(${count})`, async () => {
      await expect(this.get(AttemptHistoryTestIds.container)).toBeVisible()
      await expect(this.get(AttemptHistoryTestIds.item)).toHaveCount(count)
    })

  verifyAttemptCounter = (current: number, max: number): Promise<void> =>
    this.step(`verifyAttemptCounter(${current}/${max})`, () =>
      expect(this.get(PuzzleTestIds.attemptCounter)).toHaveText(`Attempt ${current} of ${max}`),
    )

  verifySearchInputVisible = (): Promise<void> =>
    this.step("verifySearchInputVisible", () => expect(this.get(PuzzleTestIds.searchInput)).toBeVisible())

  verifySearchInputHidden = (): Promise<void> =>
    this.step("verifySearchInputHidden", () => expect(this.get(PuzzleTestIds.searchInput)).not.toBeVisible())

  verifySelectedPlantName = (name: string): Promise<void> =>
    this.step(`verifySelectedPlantName(${name})`, () =>
      expect(this.get(PuzzleTestIds.selectedPlantName)).toHaveText(name),
    )

  goHome = (): Promise<HomePageObject> =>
    this.step("goHome", async () => {
      await this.get(PuzzleTestIds.homeLink).click()
      return new HomePageObject(this.mountResult).verifyIsShown()
    })

  gallery = (): Promise<GalleryPageObject> =>
    this.step("gallery", () => new GalleryPageObject(this.mountResult).verifyIsShown())
}
