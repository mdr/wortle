import { EditTaxonPageTestIds } from "@/app/taxa/[id]/edit/EditTaxonPageTestIds"
import { TaxonFormTestIds } from "@/components/TaxonFormTestIds"

import { expect } from "../fixtures"
import { PageObject } from "./PageObject"
import { TaxaListPageObject } from "./TaxaListPageObject"

export class EditTaxonPageObject extends PageObject {
  verifyIsShown = (): Promise<this> =>
    this.step("verifyIsShown", async () => {
      await expect(this.get(EditTaxonPageTestIds.page)).toBeVisible()
      return this
    })

  setCommonName = (commonName: string): Promise<void> =>
    this.step(`setCommonName '${commonName}'`, () => this.get(TaxonFormTestIds.commonNameInput).fill(commonName))

  saveExpectingPending = (): Promise<void> =>
    this.step("saveExpectingPending", async () => {
      const submitButton = this.get(TaxonFormTestIds.submitButton)
      await submitButton.click()
      await expect(submitButton).toHaveText("Saving...")
    })

  goToTaxaList = (): Promise<TaxaListPageObject> =>
    this.step("goToTaxaList", async () => {
      await this.clickNavLink("/taxa")
      return new TaxaListPageObject(this.mountResult).verifyIsShown()
    })
}
