import { Iso8601Date, PuzzleId, TaxonId } from "@wortle/shared"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { DefaultPuzzles, defaultPuzzles } from "@/lib/puzzles"
import { DefaultSchedule, defaultSchedule } from "@/lib/schedule"
import { testTaxaRepository } from "@/lib/taxa/testTaxa.testUtils"
import { TestPuzzles } from "@/lib/testConstants.testUtils"
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
    validateDataReferences(defaultSchedule, defaultPuzzles, testTaxaRepository)

    expect(logger.warn).not.toHaveBeenCalled()
  })

  it("logs warning when schedule references unknown puzzle ID", () => {
    const schedule = new DefaultSchedule([{ date: Iso8601Date("2026-01-01"), puzzleId: PuzzleId(999) }])

    validateDataReferences(schedule, defaultPuzzles, testTaxaRepository)

    expect(logger.warn).toHaveBeenCalledWith("data.invalidPuzzleId", "Schedule references unknown puzzle ID: 999", {
      date: Iso8601Date("2026-01-01"),
      puzzleId: PuzzleId(999),
    })
  })

  it("logs warning when puzzle references unknown taxon ID", () => {
    const puzzle = defaultPuzzles.getPuzzle(TestPuzzles.daisy.id)
    const puzzles = new DefaultPuzzles([{ ...puzzle, speciesId: TaxonId("unknown-taxon") }])
    const schedule = new DefaultSchedule([])

    validateDataReferences(schedule, puzzles, testTaxaRepository)

    expect(logger.warn).toHaveBeenCalledWith(
      "data.invalidTaxonId",
      "Puzzle references unknown taxon ID: unknown-taxon",
      { puzzleId: TestPuzzles.daisy.id, speciesId: TaxonId("unknown-taxon") },
    )
  })
})
