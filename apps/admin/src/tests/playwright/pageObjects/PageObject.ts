import type { MountResult } from "@playwright/experimental-ct-react"
import { Locator, Page } from "@playwright/test"

import { NavLinksTestIds } from "@/components/NavLinksTestIds"

import { test } from "../fixtures"

export abstract class PageObject {
  protected readonly name: string

  constructor(protected readonly mountResult: MountResult) {
    const constructorName = this.constructor.name
    if (!constructorName.endsWith("PageObject")) {
      throw new Error(`Page object class name must end with 'PageObject', but was '${constructorName}'`)
    }
    this.name = constructorName.replace("PageObject", "")
  }

  protected get page(): Page {
    return this.mountResult.page()
  }

  protected step = <T>(name: string, body: () => T | Promise<T>): Promise<T> => test.step(`${this.name}.${name}`, body)

  protected get = (testId: string): Locator => this.page.getByTestId(testId)

  protected clickNavLink = (href: string): Promise<void> => this.get(NavLinksTestIds.link(href)).click()
}
