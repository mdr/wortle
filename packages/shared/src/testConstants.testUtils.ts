import { PuzzleId } from "./puzzle"
import { SpeciesId } from "./species"

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

export const TestPuzzleIds = {
  daisy: PuzzleId(40),
  herbRobert: PuzzleId(41),
  birdsEyePrimrose: PuzzleId(42),
} as const
