import { TestPuzzles, TestSpeciesIds } from "@/lib/testConstants.testUtils"

import { test } from "../fixtures"

test("can navigate to puzzle and answer correctly on first try", async ({ homePage }) => {
  const puzzlePage = await homePage.clickPuzzle(0)
  await puzzlePage.checkScreenshot("puzzle-page")
  await puzzlePage.verifyAttemptCounter(1, 3)
  await puzzlePage.submitAnswer(TestSpeciesIds.daisy)
  await puzzlePage.verifyCorrectAnswer()
  await puzzlePage.checkScreenshot("outcome-correct-first-try")
})

test("can answer correctly after wrong attempts", async ({ homePage }) => {
  const puzzlePage = await homePage.clickPuzzle(0)

  await puzzlePage.submitAnswer(TestSpeciesIds.tansy)
  await puzzlePage.verifyAttemptHistory(1)
  await puzzlePage.verifyAttemptCounter(2, 3)

  await puzzlePage.searchForPlant("Chicory")
  await puzzlePage.selectFirstPlantOption()
  await puzzlePage.confirmSelection()
  await puzzlePage.verifyAttemptHistory(2)
  await puzzlePage.verifyAttemptCounter(3, 3)

  await puzzlePage.submitAnswer(TestSpeciesIds.daisy)
  await puzzlePage.verifyCorrectAnswer()
  await puzzlePage.checkScreenshot("outcome-correct-multiple-attempts")
})

test("fails after 3 wrong attempts", async ({ homePage }) => {
  const puzzlePage = await homePage.clickPuzzle(0)

  await puzzlePage.submitAnswer(TestSpeciesIds.tansy)

  await puzzlePage.searchForPlant("Chicory")
  await puzzlePage.selectFirstPlantOption()
  await puzzlePage.confirmSelection()

  await puzzlePage.searchForPlant("Bluebell")
  await puzzlePage.selectFirstPlantOption()
  await puzzlePage.confirmSelection()

  await puzzlePage.verifyIncorrectAnswer()
  await puzzlePage.checkScreenshot("outcome-out-of-attempts")
})

test("can give up on puzzle", async ({ homePage }) => {
  const puzzlePage = await homePage.clickPuzzle(0)
  await puzzlePage.giveUp()
  await puzzlePage.verifyGaveUp()
  await puzzlePage.checkScreenshot("outcome-gave-up")
})

test("can choose a different plant", async ({ homePage }) => {
  const puzzlePage = await homePage.clickPuzzle(0)
  await puzzlePage.searchForPlant(TestPuzzles.daisy.correctAnswer)
  await puzzlePage.selectFirstPlantOption()
  await puzzlePage.chooseDifferentPlant()
  await puzzlePage.verifySearchInputVisible()
  await puzzlePage.searchForPlant(TestPuzzles.tansy.correctAnswer)
  await puzzlePage.selectFirstPlantOption()
  await puzzlePage.verifySelectedPlantName(TestPuzzles.tansy.correctAnswer)
})

test("daily puzzle stays completed after leaving and returning", async ({ homePage }) => {
  const dailyPuzzle = await homePage.clickDailyPuzzle()
  await dailyPuzzle.submitAnswer(TestSpeciesIds.devilsBitScabious)
  await dailyPuzzle.verifyCorrectAnswer()

  const backHome = await dailyPuzzle.goHome()
  const revisitedDailyPuzzle = await backHome.clickDailyPuzzle()
  await revisitedDailyPuzzle.verifyCorrectAnswer()
  await revisitedDailyPuzzle.verifySearchInputHidden()
})
