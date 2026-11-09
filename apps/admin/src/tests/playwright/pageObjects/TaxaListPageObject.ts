import { TaxaPageTestIds } from "@/app/taxa/TaxaPageTestIds"
import { TaxaColumnsTestIds } from "@/components/TaxaColumnsTestIds"

import { expect } from "../fixtures"
import { EditTaxonPageObject } from "./EditTaxonPageObject"
import { PageObject } from "./PageObject"

export class TaxaListPageObject extends PageObject {
  verifyIsShown = (): Promise<this> =>
    this.step("verifyIsShown", async () => {
      await expect(this.get(TaxaPageTestIds.page)).toBeVisible()
      return this
    })

  verifyTaxonListed = (commonName: string): Promise<void> =>
    this.step(`verifyTaxonListed '${commonName}'`, () => expect(this.commonNameCell(commonName)).toBeVisible())

  openTaxon = (commonName: string): Promise<EditTaxonPageObject> =>
    this.step(`openTaxon '${commonName}'`, async () => {
      await this.commonNameCell(commonName).click()
      return new EditTaxonPageObject(this.mountResult).verifyIsShown()
    })

  private readonly commonNameCell = (commonName: string) =>
    this.get(TaxaColumnsTestIds.commonName).and(this.page.getByText(commonName, { exact: true }))
}
