import type { ConsoleMessage, Page } from "@playwright/test"

// Echoes page errors and console.error to the test output, and fails the test on any that it
// didn't expect. A test that provokes an error on purpose declares it with `allow`.
export class BrowserErrors {
  private readonly errors: string[] = []
  private readonly allowed: RegExp[] = []

  constructor(page: Page) {
    page.on("pageerror", (error) => this.record(`pageerror: ${error.message}`))
    page.on("console", (message) => {
      if (message.type() === "error") this.record(`console.error: ${describe(message)}`)
    })
  }

  allow = (pattern: RegExp) => {
    this.allowed.push(pattern)
  }

  verifyNoUnexpectedErrors = () => {
    const unexpected = this.errors.filter((error) => !this.allowed.some((pattern) => pattern.test(error)))
    if (unexpected.length > 0) {
      throw new Error(
        `Unexpected browser errors:\n${unexpected.join("\n")}\n` +
          "If the test provokes one on purpose, declare it with browserErrors.allow(...).",
      )
    }
  }

  private readonly record = (error: string) => {
    this.errors.push(error)
    console.warn(`[browser] ${error}`)
  }
}

const describe = (message: ConsoleMessage) => {
  const url = message.location().url
  return url ? `${message.text()} (${url})` : message.text()
}
