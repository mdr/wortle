import { test } from "../fixtures"

test("archive page shows answer for unattempted puzzle", async ({ archivePage }) => {
  await archivePage.verifyDidNotAttempt()
  await archivePage.verifySearchInputHidden()
  await archivePage.checkScreenshot("outcome-did-not-attempt")
})
