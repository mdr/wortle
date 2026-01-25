import { LoadingErrorTestIds } from "@/components/pages/loadingError/LoadingErrorTestIds"

import { expect } from "../fixtures"
import { HomePageObject } from "./HomePageObject"
import { PageObject } from "./PageObject"

export class LoadingErrorPageObject extends PageObject {
  verifyIsShown = (): Promise<this> =>
    this.step("verifyIsShown", async () => {
      await expect(this.get(LoadingErrorTestIds.screen)).toBeVisible()
      return this
    })

  clickRetryExpectingHomePage = (): Promise<HomePageObject> =>
    this.step("clickRetryExpectingHomePage", async () => {
      await this.get(LoadingErrorTestIds.retryButton).click()
      return new HomePageObject(this.mountResult).verifyIsShown()
    })
}
