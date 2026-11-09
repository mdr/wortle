import { test } from "../fixtures"

test("error page renders", async ({ errorPage, browserErrors }) => {
  browserErrors.allow(/This is a test error to verify the error boundary works!/)
  await errorPage.checkScreenshot("error-page")
})
