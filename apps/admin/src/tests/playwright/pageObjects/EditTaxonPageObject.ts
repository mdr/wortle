import { expect } from "../fixtures"
import { PageObject } from "./PageObject"
import { TaxaListPageObject } from "./TaxaListPageObject"

export class EditTaxonPageObject extends PageObject {
  verifyIsShown = (): Promise<this> =>
    this.step("verifyIsShown", async () => {
      await expect(this.page.getByText("Edit Taxon", { exact: true })).toBeVisible()
      return this
    })

  setCommonName = (commonName: string): Promise<void> =>
    this.step(`setCommonName '${commonName}'`, () =>
      this.page.getByLabel("Common Name", { exact: true }).fill(commonName),
    )

  saveExpectingPending = (): Promise<void> =>
    this.step("saveExpectingPending", async () => {
      await this.page.getByRole("button", { name: "Save" }).click()
      await expect(this.page.getByRole("button", { name: "Saving..." })).toBeVisible()
    })

  goToTaxaList = (): Promise<TaxaListPageObject> =>
    this.step("goToTaxaList", async () => {
      await this.clickNavLink("Taxa")
      return new TaxaListPageObject(this.mountResult).verifyIsShown()
    })
}
