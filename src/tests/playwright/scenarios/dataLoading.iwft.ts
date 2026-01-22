import { test } from "../fixtures"

test("shows loading screen while schedule loads, then shows home page", async ({ networkSimulator, launcher }) => {
  const stall = networkSimulator.simulateFetchScheduleStall()

  const loaderPage = await launcher.launchExpectingLoaderPage()

  stall.resolve()

  await loaderPage.waitForHomePage()
})

test("can retry after error and load home page", async ({ networkSimulator, launcher }) => {
  networkSimulator.simulateFetchScheduleError()

  const errorPage = await launcher.launchExpectingErrorPage()

  networkSimulator.simulateFetchScheduleSuccess()

  await errorPage.clickRetryExpectingHomePage()
})
