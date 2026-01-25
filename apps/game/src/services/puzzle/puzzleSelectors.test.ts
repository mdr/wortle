import { expect, it } from "vitest"

import { PuzzleOutcome } from "@/services/puzzle/PuzzleService"

import { isShareableOutcome } from "./puzzleSelectors"

it("isShareableOutcome", () => {
  expect(isShareableOutcome(PuzzleOutcome.CORRECT)).toBe(true)
  expect(isShareableOutcome(PuzzleOutcome.OUT_OF_ATTEMPTS)).toBe(true)
  expect(isShareableOutcome(PuzzleOutcome.GAVE_UP)).toBe(false)
  expect(isShareableOutcome(PuzzleOutcome.NOT_COMPLETED)).toBe(false)
  expect(isShareableOutcome(PuzzleOutcome.DID_NOT_ATTEMPT)).toBe(false)
})
