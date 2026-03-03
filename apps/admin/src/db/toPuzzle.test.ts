import {
  Degrees,
  ImageKey,
  Iso8601Date,
  License,
  MediaType,
  PuzzleId,
  TestPuzzleIds,
  TestTaxonIds,
} from "@wortle/shared"
import { describe, expect, it } from "vitest"

import { DbPuzzle } from "./puzzleTypes"
import { dbPuzzleToPuzzle, dbPuzzlesToPuzzlesData } from "./toPuzzle"

const makeDbPuzzle = (overrides: Partial<DbPuzzle> = {}): DbPuzzle => ({
  id: TestPuzzleIds.daisy,
  speciesId: TestTaxonIds.daisy,
  observationDate: Iso8601Date("2025-01-15"),
  location: {
    description: "North Yorkshire, England",
    coordinates: { latitude: Degrees(54.0), longitude: Degrees(-1.5) },
  },
  habitat: "Road verge",
  images: [{ imageKey: ImageKey("whole-plant"), caption: "Whole plant", mediaType: MediaType.IMAGE_JPEG }],
  photoAttribution: { photographer: "Test User", license: License.CC_BY_4 },
  ...overrides,
})

describe("dbPuzzleToPuzzle", () => {
  it("strips mediaType from images", () => {
    const dbPuzzle = makeDbPuzzle()

    const result = dbPuzzleToPuzzle(dbPuzzle)

    expect(result.images).toEqual([{ imageKey: ImageKey("whole-plant"), caption: "Whole plant" }])
  })
})

describe("dbPuzzlesToPuzzlesData", () => {
  it("sorts puzzles by id ascending", () => {
    const puzzles = [makeDbPuzzle({ id: TestPuzzleIds.herbRobert }), makeDbPuzzle({ id: PuzzleId(1) })]

    const result = dbPuzzlesToPuzzlesData(puzzles)

    expect(result.puzzles.map((p) => p.id)).toEqual([PuzzleId(1), TestPuzzleIds.herbRobert])
  })
})
