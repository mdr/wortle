import { beforeEach, describe, expect, it, vi } from "vitest"

import { PuzzleId } from "@/lib/Puzzle"
import { DefaultPuzzles, defaultPuzzles } from "@/lib/puzzles"
import { DefaultSchedule, defaultSchedule } from "@/lib/schedule"
import { SpeciesId } from "@/lib/species/Species"
import { testSpeciesRepository } from "@/lib/species/testSpecies.testUtils"
import { TestPuzzles } from "@/lib/testConstants.testUtils"
import { Iso8601Date } from "@/utils/brandedTypes"
import { logger } from "@/utils/Logger"

import { validateDataReferences } from "./validateDataReferences"

vi.mock("@/utils/Logger", () => ({
  logger: {
    warn: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe("validateDataReferences", () => {
  it("does not log warnings when all references are valid", () => {
    validateDataReferences(defaultSchedule, defaultPuzzles, testSpeciesRepository)

    expect(logger.warn).not.toHaveBeenCalled()
  })

  it("logs warning when schedule references unknown puzzle ID", () => {
    const schedule = new DefaultSchedule([{ date: Iso8601Date("2026-01-01"), puzzleId: PuzzleId(999) }])

    validateDataReferences(schedule, defaultPuzzles, testSpeciesRepository)

    expect(logger.warn).toHaveBeenCalledWith("data.invalidPuzzleId", "Schedule references unknown puzzle ID: 999", {
      date: Iso8601Date("2026-01-01"),
      puzzleId: PuzzleId(999),
    })
  })

  it("logs warning when puzzle references unknown species ID", () => {
    const puzzle = defaultPuzzles.getPuzzle(TestPuzzles.daisy.id)
    const puzzles = new DefaultPuzzles([{ ...puzzle, speciesId: SpeciesId("unknown-species") }])
    const schedule = new DefaultSchedule([])

    validateDataReferences(schedule, puzzles, testSpeciesRepository)

    expect(logger.warn).toHaveBeenCalledWith(
      "data.invalidSpeciesId",
      "Puzzle references unknown species ID: unknown-species",
      { puzzleId: TestPuzzles.daisy.id, speciesId: SpeciesId("unknown-species") },
    )
  })
})
