import { TestDate, TestPuzzles, TestSpeciesIds } from "@/lib/testConstants.testUtils"

import { type DailyPuzzleRecord, DailyResult } from "./GameState"
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

export const createInProgressRecord = (overrides: Partial<DailyPuzzleRecord> = {}): DailyPuzzleRecord => ({
  date: TestDate,
  puzzleId: TestPuzzles.daisy.id,
  attemptedSpeciesIds: [TestSpeciesIds.alexanders],
  ...overrides,
})
