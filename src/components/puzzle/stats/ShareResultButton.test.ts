import { describe, expect, it } from "vitest"

import { PuzzleOutcome } from "@/services/puzzle/PuzzleService"
import { Iso8601Date } from "@/utils/brandedTypes"

import { generateShareText, isShareableOutcome } from "./ShareResultButton"

it("isShareableOutcome", () => {
  expect(isShareableOutcome(PuzzleOutcome.CORRECT)).toBe(true)
  expect(isShareableOutcome(PuzzleOutcome.OUT_OF_ATTEMPTS)).toBe(true)
  expect(isShareableOutcome(PuzzleOutcome.GAVE_UP)).toBe(false)
  expect(isShareableOutcome(PuzzleOutcome.NOT_COMPLETED)).toBe(false)
  expect(isShareableOutcome(PuzzleOutcome.DID_NOT_ATTEMPT)).toBe(false)
})

describe("generateShareText", () => {
  const scheduledDate = Iso8601Date("2025-01-15")

  it("shows gold medal for 1st try correct", () => {
    expect(generateShareText({ scheduledDate, attemptCount: 1, outcome: PuzzleOutcome.CORRECT }))
      .toMatchInlineSnapshot(`
      "Wortle 15 Jan 2025 🥇 1st try

      https://wortle.app"
    `)
  })

  it("shows silver medal for 2nd try correct", () => {
    expect(generateShareText({ scheduledDate, attemptCount: 2, outcome: PuzzleOutcome.CORRECT }))
      .toMatchInlineSnapshot(`
      "Wortle 15 Jan 2025 🥈 2nd try

      https://wortle.app"
    `)
  })

  it("shows bronze medal for 3rd try correct", () => {
    expect(generateShareText({ scheduledDate, attemptCount: 3, outcome: PuzzleOutcome.CORRECT }))
      .toMatchInlineSnapshot(`
      "Wortle 15 Jan 2025 🥉 3rd try

      https://wortle.app"
    `)
  })

  it("shows X for out of attempts", () => {
    expect(generateShareText({ scheduledDate, attemptCount: 3, outcome: PuzzleOutcome.OUT_OF_ATTEMPTS }))
      .toMatchInlineSnapshot(`
      "Wortle 15 Jan 2025 ❌ 3rd try

      https://wortle.app"
    `)
  })

  it("shows X and gave up for GAVE_UP", () => {
    expect(generateShareText({ scheduledDate, attemptCount: 2, outcome: PuzzleOutcome.GAVE_UP }))
      .toMatchInlineSnapshot(`
      "Wortle 15 Jan 2025 ❌ gave up

      https://wortle.app"
    `)
  })

  it("shows X and gave up for NOT_COMPLETED", () => {
    expect(generateShareText({ scheduledDate, attemptCount: 3, outcome: PuzzleOutcome.NOT_COMPLETED }))
      .toMatchInlineSnapshot(`
      "Wortle 15 Jan 2025 ❌ gave up

      https://wortle.app"
    `)
  })
})
