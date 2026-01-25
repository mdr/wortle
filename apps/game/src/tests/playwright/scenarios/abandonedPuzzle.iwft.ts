import { assert } from "tsafe"

import { TestPuzzles, TestSpeciesIds } from "@/lib/testConstants.testUtils"
import { getNextDay } from "@/utils/dateUtils"

import { test } from "../fixtures"

test("viewing abandoned puzzle from history shows not-completed state", async ({ launcher }) => {
  const scheduledDate = TestPuzzles.devilsBitScabious.scheduledDate
  assert(scheduledDate, "Test puzzle must have a scheduled date")

  const homePage = await launcher.launchHomePage({ today: scheduledDate })
  const puzzlePage = await homePage.clickDailyPuzzle()
  await puzzlePage.submitAnswer(TestSpeciesIds.daisy)

  await puzzlePage.setClockDate(getNextDay(scheduledDate))
  const historyPage = await puzzlePage.goToHistory()
  const historyItem = await historyPage.verifySingleHistoryItem()
  const archivePage = await historyItem.click()

  await archivePage.verifyNotCompleted()
  await archivePage.verifySearchInputHidden()
  await archivePage.checkScreenshot("outcome-not-completed")
})
