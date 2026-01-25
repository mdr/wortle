import { PuzzleId } from "@/lib/Puzzle"
import { defaultPuzzles } from "@/lib/puzzles"
import { defaultSchedule } from "@/lib/schedule"
import { SpeciesId } from "@/lib/species/Species"
import { testSpeciesRepository } from "@/lib/species/testSpecies.testUtils"
import { Iso8601Date } from "@/utils/brandedTypes"
import { Option } from "@/utils/types/Option"

export interface TestPuzzle {
  id: PuzzleId
  speciesId: SpeciesId
  correctAnswer: string
  scheduledDate: Option<Iso8601Date>
}

const createTestPuzzle = (puzzleId: PuzzleId): TestPuzzle => {
  const puzzle = defaultPuzzles.getPuzzle(puzzleId)
  const species = testSpeciesRepository.getSpecies(puzzle.speciesId)
  const scheduledDate = defaultSchedule.findFirstDateForPuzzle(puzzleId)
  return {
    id: puzzleId,
    speciesId: puzzle.speciesId,
    correctAnswer: species.commonName,
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

export const TestSpeciesIds = {
  alexanders: SpeciesId("2cd4p9h.21r"),
  birdsEyePrimrose: SpeciesId("2cd4p9h.94n"),
  birdsFootTrefoil: SpeciesId("2cd4p9h.1e3"),
  daisy: SpeciesId("2cd4p9h.xbs"),
  devilsBitScabious: SpeciesId("2cd4p9h.23w"),
  feverfew: SpeciesId("2cd4p9h.yhw"),
  fieldScabious: SpeciesId("2cd4p9h.xyv"),
  herbRobert: SpeciesId("2cd4p9h.8nb"),
  tansy: SpeciesId("2cd4p9h.9b1"),
} as const

export const TestDate = Iso8601Date("2026-06-08")
