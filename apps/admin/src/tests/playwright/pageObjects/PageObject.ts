import type { MountResult } from "@playwright/experimental-ct-react"
import { Page } from "@playwright/test"

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

  protected clickNavLink = (label: string): Promise<void> =>
    this.page.getByRole("navigation").getByRole("link", { name: label, exact: true }).click()
}
