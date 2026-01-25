import { test } from "../fixtures"

test("archive page shows answer for unattempted puzzle", async ({ archivePage }) => {
  await archivePage.verifyDidNotAttempt()
  await archivePage.verifySearchInputHidden()
  await archivePage.checkScreenshot("outcome-did-not-attempt")
})

test("archive page redirects to history for invalid date", async ({ launcher }) => {
  const historyPage = await launcher.launchArchivePageWithInvalidDate("not-a-date")
  await historyPage.verifyIsShown()
})
