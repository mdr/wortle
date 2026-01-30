import { TestSpeciesIds } from "@wortle/shared"

import { test } from "../fixtures"

test("share button copies result to clipboard after correct answer", async ({ homePage, page }) => {
  await page.context().grantPermissions(["clipboard-write", "clipboard-read"])

  const puzzlePage = await homePage.clickDailyPuzzle()
  await puzzlePage.verifyShareButtonHidden()

  await puzzlePage.submitAnswer(TestSpeciesIds.devilsBitScabious)
  await puzzlePage.verifyCorrectAnswer()
  await puzzlePage.verifyShareButtonVisible()
  await puzzlePage.clickShareResult()
  await puzzlePage.verifyShareCopied()
})
