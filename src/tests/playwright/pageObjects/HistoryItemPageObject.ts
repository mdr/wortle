import type { MountResult } from "@playwright/experimental-ct-react"
import { Locator } from "@playwright/test"

import { test } from "../fixtures"
import { PuzzlePageObject } from "./PuzzlePageObject"

export class HistoryItemPageObject {
  constructor(
    private readonly mountResult: MountResult,
    private readonly locator: Locator,
  ) {}

  click = (): Promise<PuzzlePageObject> =>
    test.step("HistoryItem.click", async () => {
      await this.locator.click()
      return new PuzzlePageObject(this.mountResult).verifyIsShown()
    })
}
