import { test } from "../fixtures"

test("about page renders", async ({ homePage }) => {
  const aboutPage = await homePage.goToAbout()
  await aboutPage.checkScreenshot("about-page")
})
