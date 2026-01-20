import { TestDate, TestSpeciesIds } from "@/lib/testConstants.testUtils"

import { PassOrFail, type PuzzleHistoryEntry } from "./HistoryRecord"
import { HistoryStore } from "./HistoryStore"
import { createMemoryStorage } from "./storage.testUtils"

export const createHistoryStore = () => new HistoryStore(createMemoryStorage())

export const createPuzzleHistoryEntry = (overrides: Partial<PuzzleHistoryEntry> = {}): PuzzleHistoryEntry => ({
  date: TestDate,
  result: PassOrFail.PASS,
  submittedSpecies: [TestSpeciesIds.alexanders],
  ...overrides,
})

export const createInProgressEntry = (overrides: Partial<PuzzleHistoryEntry> = {}): PuzzleHistoryEntry => ({
  date: TestDate,
  submittedSpecies: [TestSpeciesIds.alexanders],
  ...overrides,
})
