import { Degrees, ImageKey, Iso8601Date, TestPuzzleIds, TestSpeciesIds } from "@wortle/shared"
import { describe, expect, it } from "vitest"

import { CreateResult, DeleteResult, PuzzleRepository, UpdateResult } from "./PuzzleRepository"
import { DbPuzzle } from "./puzzleTypes"
import { createTestDb } from "./testDb.testUtils"

const makeDbPuzzle = (overrides: Partial<DbPuzzle> = {}): DbPuzzle => ({
  id: TestPuzzleIds.daisy,
  speciesId: TestSpeciesIds.daisy,
  observationDate: Iso8601Date("2025-01-15"),
  location: {
    description: "North Yorkshire, England",
    coordinates: { latitude: Degrees(54.0), longitude: Degrees(-1.5) },
  },
  habitat: "Road verge",
  images: [{ imageKey: ImageKey("whole-plant"), caption: "Whole plant" }],
  photoAttribution: { photographer: "Test User", license: "CC-BY 4.0" },
  ...overrides,
})

const makePuzzleRepository = async (): Promise<PuzzleRepository> => {
  const { db } = await createTestDb()
  return new PuzzleRepository(db)
}

describe("PuzzleRepository", () => {
  describe("list", () => {
    it("returns empty array when no puzzles exist", async () => {
      const repository = await makePuzzleRepository()

      const result = await repository.list()

      expect(result).toEqual([])
    })

    it("returns all puzzles", async () => {
      const repository = await makePuzzleRepository()
      const puzzle1 = makeDbPuzzle({ id: TestPuzzleIds.daisy })
      const puzzle2 = makeDbPuzzle({ id: TestPuzzleIds.herbRobert })
      await repository.create(puzzle1)
      await repository.create(puzzle2)

      const result = await repository.list()

      expect(result).toEqual([puzzle1, puzzle2])
    })
  })

  describe("findById", () => {
    it("returns undefined when puzzle does not exist", async () => {
      const repository = await makePuzzleRepository()

      const result = await repository.findById(TestPuzzleIds.birdsEyePrimrose)

      expect(result).toBeUndefined()
    })

    it("returns puzzle when it exists", async () => {
      const repository = await makePuzzleRepository()
      const puzzle = makeDbPuzzle()
      await repository.create(puzzle)

      const result = await repository.findById(puzzle.id)

      expect(result).toEqual(puzzle)
    })
  })

  describe("create", () => {
    it("creates a new puzzle and returns CREATED", async () => {
      const repository = await makePuzzleRepository()
      const puzzle = makeDbPuzzle()

      const result = await repository.create(puzzle)

      expect(result).toBe(CreateResult.CREATED)
      expect(await repository.findById(puzzle.id)).toEqual(puzzle)
    })

    it("returns ALREADY_EXISTS when puzzle with same id exists", async () => {
      const repository = await makePuzzleRepository()
      const puzzle = makeDbPuzzle()
      await repository.create(puzzle)

      const result = await repository.create(puzzle)

      expect(result).toBe(CreateResult.ALREADY_EXISTS)
    })
  })

  describe("update", () => {
    it("returns NOT_FOUND when puzzle does not exist", async () => {
      const repository = await makePuzzleRepository()
      const puzzle = makeDbPuzzle()

      const result = await repository.update(puzzle)

      expect(result).toBe(UpdateResult.NOT_FOUND)
    })

    it("updates existing puzzle and returns UPDATED", async () => {
      const repository = await makePuzzleRepository()
      const puzzle = makeDbPuzzle({ habitat: "Road verge" })
      await repository.create(puzzle)

      const updated = { ...puzzle, habitat: "Meadow" }
      const result = await repository.update(updated)

      expect(result).toBe(UpdateResult.UPDATED)
      expect(await repository.findById(puzzle.id)).toEqual(updated)
    })
  })

  describe("delete", () => {
    it("returns NOT_FOUND when puzzle does not exist", async () => {
      const repository = await makePuzzleRepository()

      const result = await repository.delete(TestPuzzleIds.birdsEyePrimrose)

      expect(result).toBe(DeleteResult.NOT_FOUND)
    })

    it("deletes existing puzzle and returns DELETED", async () => {
      const repository = await makePuzzleRepository()
      const puzzle = makeDbPuzzle()
      await repository.create(puzzle)

      const result = await repository.delete(puzzle.id)

      expect(result).toBe(DeleteResult.DELETED)
      expect(await repository.findById(puzzle.id)).toBeUndefined()
    })
  })
})
