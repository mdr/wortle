import { test } from "../fixtures"

test("shows loading screen while data loads, then shows home page", async ({ networkSimulator, launcher }) => {
  const scheduleStall = networkSimulator.simulateFetchScheduleStall()
  const puzzlesStall = networkSimulator.simulateFetchPuzzlesStall()

  const loaderPage = await launcher.launchExpectingLoaderPage()

  scheduleStall.resolve()
  puzzlesStall.resolve()

  await loaderPage.waitForHomePage()
})

test("can retry after error and load home page", async ({ networkSimulator, launcher }) => {
  networkSimulator.simulateFetchAllError()

  const errorPage = await launcher.launchExpectingErrorPage()

  networkSimulator.simulateFetchAllSuccess()

  await errorPage.clickRetryExpectingHomePage()
})
