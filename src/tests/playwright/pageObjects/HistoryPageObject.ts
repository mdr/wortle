import { HistoryTestIds } from "@/components/history/HistoryTestIds"

import { expect } from "../fixtures"
import { HistoryItemPageObject } from "./HistoryItemPageObject"
import { PageObject } from "./PageObject"

export class HistoryPageObject extends PageObject {
  verifyIsShown = (): Promise<this> =>
    this.step("verifyIsShown", async () => {
      await expect(this.get(HistoryTestIds.page)).toBeVisible()
      return this
    })

  verifyEmptyState = (): Promise<void> =>
    this.step("verifyEmptyState", () => expect(this.get(HistoryTestIds.emptyState)).toBeVisible())

  verifyHistoryItemCount = (count: number): Promise<void> =>
    this.step(`verifyHistoryItemCount ${count}`, () => expect(this.get(HistoryTestIds.item)).toHaveCount(count))

  verifySingleHistoryItem = (): Promise<HistoryItemPageObject> =>
    this.step("verifySingleHistoryItem", async () => {
      await expect(this.get(HistoryTestIds.item)).toHaveCount(1)
      return new HistoryItemPageObject(this.mountResult, this.get(HistoryTestIds.item).first())
    })

  verifyStatsVisible = (): Promise<void> =>
    this.step("verifyStatsVisible", () => expect(this.get(HistoryTestIds.stats)).toBeVisible())

  verifyStatsHidden = (): Promise<void> =>
    this.step("verifyStatsHidden", () => expect(this.get(HistoryTestIds.stats)).not.toBeVisible())
}
