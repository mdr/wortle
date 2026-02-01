import AxeBuilder from "@axe-core/playwright"
import type { MountResult } from "@playwright/experimental-ct-react"
import { Locator, Page } from "@playwright/test"
import { Iso8601Date } from "@wortle/shared"
import { platform } from "os"
import { assert } from "tsafe"

import { expect, test } from "../fixtures"

type TestId = string

interface ScreenshotOptions {
  testIdToCapture?: TestId
  elementsToMask?: Locator[]
}

export abstract class PageObject {
  protected readonly name: string

  constructor(protected readonly mountResult: MountResult) {
    const constructorName = this.constructor.name
    assert(
      constructorName.endsWith("PageObject"),
      `Page object class name must end with 'PageObject', but was '${constructorName}'`,
    )
    this.name = constructorName.replace("PageObject", "")
  }

  protected get page(): Page {
    return this.mountResult.page()
  }

  protected step = <T>(name: string, body: () => T | Promise<T>): Promise<T> => test.step(`${this.name}.${name}`, body)

  protected get = (testId: string): Locator => this.page.getByTestId(testId)

  protected getByText = (text: string | RegExp): Locator => this.page.getByText(text)

  expectVisible = (testId: string): Promise<void> =>
    this.step(`expectVisible '${testId}'`, () => expect(this.get(testId)).toBeVisible())

  expectTextVisible = (text: string | RegExp): Promise<void> =>
    this.step(`expectTextVisible '${text}'`, () => expect(this.getByText(text)).toBeVisible())

  checkScreenshot = (name: string, { testIdToCapture, elementsToMask }: ScreenshotOptions = {}): Promise<void> =>
    this.step(`checkScreenshot '${name}'`, async () => {
      await this.verifyIsAccessible()

      if (platform() !== "linux") {
        return
      }
      const locator = testIdToCapture === undefined ? this.mountResult : this.get(testIdToCapture)
      await expect(locator).toHaveScreenshot(`${name}.png`, { mask: elementsToMask })
    })

  private readonly verifyIsAccessible = (): Promise<void> =>
    expect(async () => {
      const accessibilityScanResults = await new AxeBuilder({ page: this.page }).analyze()
      expect(accessibilityScanResults.violations).toEqual([])
    }).toPass()

  setClockDate = (date: Iso8601Date): Promise<void> =>
    this.step(`setClockDate(${date})`, () => this.page.evaluate((d) => window.testHooks?.setClockDate(d), date))
}
