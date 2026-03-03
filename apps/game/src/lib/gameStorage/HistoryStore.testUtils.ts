import { TestTaxonIds } from "@wortle/shared"

import { TestDate } from "@/lib/testConstants.testUtils"

import { PassOrFail, type PuzzleHistoryEntry } from "./HistoryRecord"
import { HistoryStore } from "./HistoryStore"
import { createMemoryStorage } from "./storage.testUtils"

export const createHistoryStore = () => new HistoryStore(createMemoryStorage())

export const createPuzzleHistoryEntry = (overrides: Partial<PuzzleHistoryEntry> = {}): PuzzleHistoryEntry => ({
  date: TestDate,
  result: PassOrFail.PASS,
  submittedSpecies: [TestTaxonIds.alexanders],
  ...overrides,
})

export const createInProgressEntry = (overrides: Partial<PuzzleHistoryEntry> = {}): PuzzleHistoryEntry => ({
  date: TestDate,
  submittedSpecies: [TestTaxonIds.alexanders],
  ...overrides,
})
