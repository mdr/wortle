import { assert } from "tsafe"

import { TestPuzzles, TestSpeciesIds } from "@/tests/playwright/testConstants.testUtils"

import { type DailyPuzzleRecord, DailyResult, StatsStorage } from "./StatsStorage"
import { createMemoryStorage } from "./storage.testUtils"

const defaultDate = TestPuzzles.daisy.scheduledDate
assert(defaultDate !== undefined)

export const createStatsStorage = () => new StatsStorage(createMemoryStorage())

export const createDailyPuzzleRecord = (overrides: Partial<DailyPuzzleRecord> = {}): DailyPuzzleRecord => ({
  date: defaultDate,
  puzzleId: TestPuzzles.daisy.id,
  result: DailyResult.PASS,
  attemptedSpeciesIds: [TestSpeciesIds.alexanders],
  ...overrides,
})
