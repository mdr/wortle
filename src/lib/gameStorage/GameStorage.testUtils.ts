import { TestDate, TestPuzzles, TestSpeciesIds } from "@/lib/testConstants.testUtils"

import { type DailyInProgressRecord, type DailyPuzzleRecord, DailyResult } from "./GameState"
import { GameStorage } from "./GameStorage"
import { createMemoryStorage } from "./storage.testUtils"

export const createGameStorage = () => new GameStorage(createMemoryStorage())

export const createDailyPuzzleRecord = (overrides: Partial<DailyPuzzleRecord> = {}): DailyPuzzleRecord => ({
  date: TestDate,
  puzzleId: TestPuzzles.daisy.id,
  result: DailyResult.PASS,
  attemptedSpeciesIds: [TestSpeciesIds.alexanders],
  ...overrides,
})

export const createDailyInProgressRecord = (overrides: Partial<DailyInProgressRecord> = {}): DailyInProgressRecord => ({
  date: TestDate,
  attemptedSpeciesIds: [TestSpeciesIds.alexanders],
  ...overrides,
})
