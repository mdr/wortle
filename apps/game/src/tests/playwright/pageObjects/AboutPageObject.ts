import { expect } from "../fixtures"
import { PageObject } from "./PageObject"

export class AboutPageObject extends PageObject {
  verifyIsShown = (): Promise<this> =>
    this.step("verifyIsShown", async () => {
      await expect(this.getByText("About Wortle")).toBeVisible()
      return this
    })
}
