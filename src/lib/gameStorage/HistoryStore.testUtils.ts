import { TestDate, TestSpeciesIds } from "@/lib/testConstants.testUtils"

import { PassOrFail, type PuzzleAttempt } from "./HistoryRecord"
import { HistoryStore } from "./HistoryStore"
import { createMemoryStorage } from "./storage.testUtils"

export const createHistoryStore = () => new HistoryStore(createMemoryStorage())

export const createPuzzleAttempt = (overrides: Partial<PuzzleAttempt> = {}): PuzzleAttempt => ({
  date: TestDate,
  result: PassOrFail.PASS,
  submittedSpecies: [TestSpeciesIds.alexanders],
  ...overrides,
})

export const createInProgressAttempt = (overrides: Partial<PuzzleAttempt> = {}): PuzzleAttempt => ({
  date: TestDate,
  submittedSpecies: [TestSpeciesIds.alexanders],
  ...overrides,
})
