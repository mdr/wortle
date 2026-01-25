import { test } from "../fixtures"

test("error page renders", async ({ errorPage }) => {
  await errorPage.checkScreenshot("error-page")
})
