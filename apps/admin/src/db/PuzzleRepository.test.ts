import { Degrees, ImageKey, Iso8601Date, License, MediaType, TestPuzzleIds, TestTaxonIds } from "@wortle/shared"
import { describe, expect, it } from "vitest"

import { CreateResult, DeleteResult, PuzzleRepository, UpdateResult } from "./PuzzleRepository"
import { DbPuzzle } from "./puzzleTypes"
import { createTestDb } from "./testDb.testUtils"

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

  describe("listWithSyncStatus", () => {
    it("returns puzzles with imagesSynced false after create", async () => {
      const repository = await makePuzzleRepository()
      const puzzle = makeDbPuzzle()
      await repository.create(puzzle)

      const result = await repository.listWithSyncStatus()

      expect(result).toEqual([{ puzzle, imagesSynced: false }])
    })

    it("returns imagesSynced true after markImagesSynced", async () => {
      const repository = await makePuzzleRepository()
      const puzzle = makeDbPuzzle()
      await repository.create(puzzle)
      await repository.markImagesSynced([puzzle.id])

      const result = await repository.listWithSyncStatus()

      expect(result[0].imagesSynced).toBe(true)
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

    it("resets imagesSynced to false on update", async () => {
      const repository = await makePuzzleRepository()
      const puzzle = makeDbPuzzle()
      await repository.create(puzzle)
      await repository.markImagesSynced([puzzle.id])

      await repository.update({ ...puzzle, habitat: "Meadow" })

      const statuses = await repository.listWithSyncStatus()
      expect(statuses[0].imagesSynced).toBe(false)
    })
  })

  describe("markImagesSynced", () => {
    it("marks specified puzzles as synced", async () => {
      const repository = await makePuzzleRepository()
      const puzzle1 = makeDbPuzzle({ id: TestPuzzleIds.daisy })
      const puzzle2 = makeDbPuzzle({ id: TestPuzzleIds.herbRobert })
      await repository.create(puzzle1)
      await repository.create(puzzle2)

      await repository.markImagesSynced([puzzle1.id])

      const statuses = await repository.listWithSyncStatus()
      const sorted = statuses.toSorted((a, b) => a.puzzle.id - b.puzzle.id)
      expect(sorted[0].imagesSynced).toBe(true)
      expect(sorted[1].imagesSynced).toBe(false)
    })

    it("does nothing when given empty array", async () => {
      const repository = await makePuzzleRepository()

      await repository.markImagesSynced([])
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
