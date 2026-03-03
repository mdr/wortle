import { Iso8601Date, PuzzleId, TaxonId } from "@wortle/shared"

import { defaultPuzzles } from "@/lib/puzzles"
import { defaultSchedule } from "@/lib/schedule"
import { testTaxaRepository } from "@/lib/taxa/testTaxa.testUtils"
import { Option } from "@/utils/types/Option"

export interface TestPuzzle {
  id: PuzzleId
  speciesId: TaxonId
  correctAnswer: string
  scheduledDate: Option<Iso8601Date>
}

const createTestPuzzle = (puzzleId: PuzzleId): TestPuzzle => {
  const puzzle = defaultPuzzles.getPuzzle(puzzleId)
  const taxon = testTaxaRepository.getTaxon(puzzle.speciesId)
  const scheduledDate = defaultSchedule.findFirstDateForPuzzle(puzzleId)
  return {
    id: puzzleId,
    speciesId: puzzle.speciesId,
    correctAnswer: taxon.commonName,
    scheduledDate,
  }
}

export const TestPuzzles = {
  daisy: createTestPuzzle(PuzzleId(40)),
  herbRobert: createTestPuzzle(PuzzleId(41)),
  birdsEyePrimrose: createTestPuzzle(PuzzleId(42)),
  devilsBitScabious: createTestPuzzle(PuzzleId(43)),
  tansy: createTestPuzzle(PuzzleId(44)),
} as const

export const TestDate = Iso8601Date("2026-06-08")
