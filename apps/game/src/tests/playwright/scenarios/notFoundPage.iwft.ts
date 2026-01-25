import { test } from "../fixtures"

test("not found page renders", async ({ notFoundPage }) => {
  await notFoundPage.checkScreenshot("not-found-page")
})
