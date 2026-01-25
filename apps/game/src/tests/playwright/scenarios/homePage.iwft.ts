import { test } from "../fixtures"

test("homepage renders", async ({ homePage }) => {
  await homePage.verifyPuzzleCount(5)
  await homePage.checkScreenshot("homepage")
})
