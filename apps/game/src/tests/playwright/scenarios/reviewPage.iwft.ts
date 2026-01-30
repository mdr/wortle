import { TestSpeciesIds } from "@wortle/shared"

import { TestPuzzles } from "@/lib/testConstants.testUtils"

import { test } from "../fixtures"

test("review puzzle does not save to daily stats", async ({ launcher }) => {
  const reviewPage = await launcher.launchReviewPage(TestPuzzles.daisy.id)
  await reviewPage.submitAnswer(TestSpeciesIds.daisy)
  await reviewPage.verifyCorrectAnswer()

  const homePage = await reviewPage.goHome()
  const historyPage = await homePage.goToHistory()
  await historyPage.verifyEmptyState()
  await historyPage.verifyStatsHidden()
})
