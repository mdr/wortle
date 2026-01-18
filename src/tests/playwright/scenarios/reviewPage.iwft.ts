import { TestPuzzles } from "@/lib/testConstants.testUtils"

import { test } from "../fixtures"

test("review puzzle does not save to daily stats", async ({ launcher }) => {
  const reviewPage = await launcher.launchReviewPage(TestPuzzles.daisy.id)
  await reviewPage.searchForPlant(TestPuzzles.daisy.correctAnswer)
  await reviewPage.selectFirstPlantOption()
  await reviewPage.submitAnswer()
  await reviewPage.verifyCorrectAnswer()

  const homePage = await reviewPage.goHome()
  const historyPage = await homePage.goToHistory()
  await historyPage.verifyEmptyState()
  await historyPage.verifyStatsHidden()
})
