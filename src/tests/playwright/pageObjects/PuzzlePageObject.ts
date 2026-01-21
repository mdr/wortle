import {
  AnswerTestIds,
  AttemptHistoryTestIds,
  PuzzleTestIds,
  ShareResultTestIds,
} from "@/components/puzzle/PuzzleTestIds"
import { SharedTestIds } from "@/components/shared/SharedTestIds"
import { getSpecies } from "@/lib/species/plants"
import { SpeciesId } from "@/lib/species/Species"

import { expect } from "../fixtures"
import { GalleryPageObject } from "./GalleryPageObject"
import { HistoryPageObject } from "./HistoryPageObject"
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

  confirmSelection = (): Promise<void> =>
    this.step("confirmSelection", () => this.get(PuzzleTestIds.submitAnswer).click())

  submitAnswer = (speciesId: SpeciesId): Promise<void> =>
    this.step(`submitAnswer(${speciesId})`, async () => {
      const species = getSpecies(speciesId)
      await this.searchForPlant(species.commonName)
      await this.selectFirstPlantOption()
      await this.confirmSelection()
    })

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

  verifyNotCompleted = (): Promise<void> =>
    this.step("verifyNotCompleted", () => expect(this.get(AnswerTestIds.notCompleted)).toBeVisible())

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

  goToHistory = (): Promise<HistoryPageObject> =>
    this.step("goToHistory", async () => {
      await this.get(SharedTestIds.headerHistoryLink).click()
      return new HistoryPageObject(this.mountResult).verifyIsShown()
    })

  verifyShareButtonVisible = (): Promise<void> =>
    this.step("verifyShareButtonVisible", () => expect(this.get(ShareResultTestIds.button)).toBeVisible())

  verifyShareButtonHidden = (): Promise<void> =>
    this.step("verifyShareButtonHidden", () => expect(this.get(ShareResultTestIds.button)).not.toBeVisible())

  clickShareResult = (): Promise<void> =>
    this.step("clickShareResult", () => this.get(ShareResultTestIds.button).click())

  verifyShareCopied = (): Promise<void> =>
    this.step("verifyShareCopied", () => expect(this.get(ShareResultTestIds.copiedState)).toBeVisible())

  hoverGlossaryTerm = (term: string): Promise<void> =>
    this.step(`hoverGlossaryTerm '${term}'`, () => this.page.getByRole("button", { name: term }).hover({ force: true }))

  verifyGlossaryPopover = (term: string, definition: string): Promise<void> =>
    this.step(`verifyGlossaryPopover '${term}'`, async () => {
      await expect(this.page.getByText(term, { exact: true })).toBeVisible()
      await expect(this.page.getByText(definition)).toBeVisible()
    })
}
