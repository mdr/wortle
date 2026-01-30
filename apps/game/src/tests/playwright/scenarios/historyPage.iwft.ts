import { TestSpeciesIds } from "@wortle/shared"

import { test } from "../fixtures"

test("history page shows empty state when no puzzles completed", async ({ historyPage }) => {
  await historyPage.verifyEmptyState()
  await historyPage.verifyStatsHidden()
  await historyPage.checkScreenshot("history-empty")
})

test("history page shows completed puzzle", async ({ homePage }) => {
  const puzzlePage = await homePage.clickDailyPuzzle()
  await puzzlePage.submitAnswer(TestSpeciesIds.devilsBitScabious)
  await puzzlePage.verifyCorrectAnswer()

  const home = await puzzlePage.goHome()
  const historyPage = await home.goToHistory()
  await historyPage.verifyHistoryItemCount(1)
  await historyPage.verifyStatsVisible()
  await historyPage.checkScreenshot("history-with-item")
})
