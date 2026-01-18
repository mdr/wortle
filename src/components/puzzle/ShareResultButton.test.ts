import { describe, expect, it } from "vitest"

import { PuzzleOutcome } from "@/services/puzzle/PuzzleService"

import { isShareableOutcome } from "./ShareResultButton"

describe("isShareableOutcome", () => {
  it("returns true for CORRECT", () => {
    expect(isShareableOutcome(PuzzleOutcome.CORRECT)).toBe(true)
  })

  it("returns true for OUT_OF_ATTEMPTS", () => {
    expect(isShareableOutcome(PuzzleOutcome.OUT_OF_ATTEMPTS)).toBe(true)
  })

  it("returns false for GAVE_UP", () => {
    expect(isShareableOutcome(PuzzleOutcome.GAVE_UP)).toBe(false)
  })

  it("returns false for NOT_COMPLETED", () => {
    expect(isShareableOutcome(PuzzleOutcome.NOT_COMPLETED)).toBe(false)
  })

  it("returns false for DID_NOT_ATTEMPT", () => {
    expect(isShareableOutcome(PuzzleOutcome.DID_NOT_ATTEMPT)).toBe(false)
  })
})
