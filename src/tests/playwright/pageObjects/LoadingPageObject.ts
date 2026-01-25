import { LoadingTestIds } from "@/components/loading/LoadingTestIds"

import { expect } from "../fixtures"
import { HomePageObject } from "./HomePageObject"
import { PageObject } from "./PageObject"

export class LoadingPageObject extends PageObject {
  verifyIsShown = (): Promise<this> =>
    this.step("verifyIsShown", async () => {
      await expect(this.get(LoadingTestIds.loadingScreen)).toBeVisible()
      return this
    })

  waitForHomePage = (): Promise<HomePageObject> =>
    this.step("waitForHomePage", async () => {
      return new HomePageObject(this.mountResult).verifyIsShown()
    })
}
