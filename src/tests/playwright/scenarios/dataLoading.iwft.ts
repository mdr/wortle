import { test } from "../fixtures"

test("shows loading screen while schedule loads, then shows home page", async ({ networkSimulator, launcher }) => {
  const stall = networkSimulator.stallSchedule()

  const loaderPage = await launcher.launchExpectingLoaderPage()

  stall.resolve()

  await loaderPage.waitForHomePage()
})
