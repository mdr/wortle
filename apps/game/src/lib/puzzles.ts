import { Degrees, ImageKey, Iso8601Date, License, type Puzzle, PuzzleId, SpeciesId } from "@wortle/shared"
import { assert } from "tsafe"

import { Option } from "@/utils/types/Option"

export interface Puzzles {
  findPuzzle: (id: PuzzleId) => Option<Puzzle>
  getPuzzle: (id: PuzzleId) => Puzzle
  getAllPuzzleIds: () => PuzzleId[]
}

export class DefaultPuzzles implements Puzzles {
  constructor(private readonly puzzles: Puzzle[]) {}

  findPuzzle = (id: PuzzleId): Option<Puzzle> => this.puzzles.find((p) => p.id === id)

  getPuzzle = (id: PuzzleId): Puzzle => {
    const puzzle = this.findPuzzle(id)
    assert(puzzle, `Unknown puzzle id: ${id}`)
    return puzzle
  }

  getAllPuzzleIds = (): PuzzleId[] => this.puzzles.map((p) => p.id)
}

const defaultPuzzleData: Puzzle[] = [
  {
    id: PuzzleId(40),
    speciesId: SpeciesId("2cd4p9h.xbs"), // Daisy
    observationDate: Iso8601Date("2025-12-19"),
    location: {
      description: "North Yorkshire, England",
      coordinates: { latitude: Degrees(54.0023389), longitude: Degrees(-1.5102306) },
    },
    habitat: "Road verge",
    images: [
      { imageKey: ImageKey("whole-plant"), caption: "Whole plant" },
      { imageKey: ImageKey("flower-close-up"), caption: "Flower close-up" },
      { imageKey: ImageKey("leaves-close-up"), caption: "Leaves close-up" },
    ],
    photoAttribution: {
      photographer: "Matt Russell",
      license: License.CC_BY_4,
    },
  },
  {
    id: PuzzleId(41),
    speciesId: SpeciesId("2cd4p9h.8nb"), // Herb-Robert
    observationDate: Iso8601Date("2023-07-20"),
    location: {
      description: "North Yorkshire, England",
      coordinates: { latitude: Degrees(53.9991278), longitude: Degrees(-1.5054472) },
    },
    habitat: "Pavement plant",
    images: [
      { imageKey: ImageKey("plant"), caption: "Whole plant" },
      { imageKey: ImageKey("flower-closeup"), caption: "Flower close-up" },
    ],
    photoAttribution: {
      photographer: "Matt Russell",
      license: License.CC_BY_4,
    },
  },
  {
    id: PuzzleId(42),
    speciesId: SpeciesId("2cd4p9h.94n"), // Bird's-eye Primrose
    observationDate: Iso8601Date("2024-05-18"),
    location: {
      description: "North Yorkshire, England",
      coordinates: { latitude: Degrees(54.2015), longitude: Degrees(-2.3500028) },
    },
    habitat: "Former limestone quarry",
    images: [
      { imageKey: ImageKey("plant"), caption: "Whole plant" },
      { imageKey: ImageKey("close-up-of-flowers"), caption: "Close-up of flowers" },
      { imageKey: ImageKey("leaves"), caption: "Leaves" },
    ],
    photoAttribution: {
      photographer: "Matt Russell",
      license: License.CC_BY_4,
    },
  },
  {
    id: PuzzleId(43),
    speciesId: SpeciesId("2cd4p9h.23w"), // Devil's-bit Scabious
    observationDate: Iso8601Date("2025-08-13"),
    location: {
      description: "Northumberland, England",
      coordinates: { latitude: Degrees(55.2267806), longitude: Degrees(-2.5802806) },
    },
    habitat: "Woodland",
    images: [
      { imageKey: ImageKey("flower-head"), caption: "Flower head" },
      { imageKey: ImageKey("flower-rear"), caption: "Rear view of flower" },
      { imageKey: ImageKey("flower-closeup"), caption: "Close up of flower head" },
      { imageKey: ImageKey("leaves"), caption: "Leaves" },
    ],
    photoAttribution: {
      photographer: "Matt Russell",
      license: License.CC_BY_4,
    },
  },
  {
    id: PuzzleId(44),
    speciesId: SpeciesId("2cd4p9h.9b1"), // Tansy
    observationDate: Iso8601Date("2023-08-03"),
    location: {
      description: "North Yorkshire, England",
      coordinates: { latitude: Degrees(53.9788528), longitude: Degrees(-1.3101916) },
    },
    habitat: "Flood meadow",
    images: [
      { imageKey: ImageKey("plant"), caption: "Whole plant" },
      { imageKey: ImageKey("flower-closeup"), caption: "Flower heads" },
      { imageKey: ImageKey("leaves"), caption: "Leaves" },
    ],
    photoAttribution: {
      photographer: "Matt Russell",
      license: License.CC_BY_4,
    },
  },
]

export const defaultPuzzles: Puzzles = new DefaultPuzzles(defaultPuzzleData)
