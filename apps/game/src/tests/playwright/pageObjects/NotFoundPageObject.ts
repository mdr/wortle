import { NotFoundTestIds } from "@/components/pages/notFound/NotFoundTestIds"

import { PageObject } from "./PageObject"

export class NotFoundPageObject extends PageObject {
  verifyIsShown = async (): Promise<this> => {
    await this.expectVisible(NotFoundTestIds.page)
    return this
  }
}
