import { TestPuzzleIds } from "@wortle/shared"
import { describe, expect, it } from "vitest"

import { FakePuzzleRepository } from "@/db/FakePuzzleRepository.testUtils"

import { TrpcErrorCode } from "./errorCodes"
import { router } from "./init"
import { createPuzzleRouter } from "./puzzleRouter"
import { makeApiPuzzle, makeDbPuzzle, testContext } from "./testFactories.testUtils"

const createTestCaller = (puzzleRepository = new FakePuzzleRepository()) => {
  const puzzleRouter = createPuzzleRouter(puzzleRepository)
  const testRouter = router({ puzzles: puzzleRouter })
  return testRouter.createCaller(testContext)
}

describe("puzzleRouter", () => {
  describe("list", () => {
    it("returns empty array when no puzzles exist", async () => {
      const caller = createTestCaller()

      const result = await caller.puzzles.list()

      expect(result).toEqual([])
    })

    it("returns all puzzles", async () => {
      const repo = new FakePuzzleRepository()
      await repo.create(makeDbPuzzle({ id: TestPuzzleIds.daisy }))
      await repo.create(makeDbPuzzle({ id: TestPuzzleIds.herbRobert }))
      const caller = createTestCaller(repo)

      const result = await caller.puzzles.list()

      expect(result.map((p) => p.id)).toIncludeSameMembers([TestPuzzleIds.daisy, TestPuzzleIds.herbRobert])
    })
  })

  describe("get", () => {
    it("returns puzzle when it exists", async () => {
      const repo = new FakePuzzleRepository()
      await repo.create(makeDbPuzzle({ id: TestPuzzleIds.daisy }))
      const caller = createTestCaller(repo)

      const result = await caller.puzzles.get(TestPuzzleIds.daisy)

      expect(result).toEqual(makeApiPuzzle({ id: TestPuzzleIds.daisy }))
    })

    it("throws NOT_FOUND when puzzle does not exist", async () => {
      const caller = createTestCaller()

      await expect(caller.puzzles.get(TestPuzzleIds.daisy)).rejects.toMatchObject({
        code: TrpcErrorCode.NOT_FOUND,
      })
    })
  })

  describe("create", () => {
    it("creates puzzle and returns it", async () => {
      const repo = new FakePuzzleRepository()
      const caller = createTestCaller(repo)
      const puzzle = makeApiPuzzle({ id: TestPuzzleIds.daisy })

      const result = await caller.puzzles.create(puzzle)

      expect(result).toEqual(puzzle)
      expect(await repo.findById(TestPuzzleIds.daisy)).toBeDefined()
    })

    it("throws CONFLICT when puzzle already exists", async () => {
      const repo = new FakePuzzleRepository()
      await repo.create(makeDbPuzzle({ id: TestPuzzleIds.daisy }))
      const caller = createTestCaller(repo)

      await expect(caller.puzzles.create(makeApiPuzzle({ id: TestPuzzleIds.daisy }))).rejects.toMatchObject({
        code: TrpcErrorCode.CONFLICT,
      })
    })
  })

  describe("update", () => {
    it("updates puzzle and returns it", async () => {
      const repo = new FakePuzzleRepository()
      await repo.create(makeDbPuzzle({ id: TestPuzzleIds.daisy }))
      const caller = createTestCaller(repo)
      const updated = makeApiPuzzle({ id: TestPuzzleIds.daisy, habitat: "Meadow" })

      const result = await caller.puzzles.update(updated)

      expect(result).toEqual(updated)
      const stored = await repo.findById(TestPuzzleIds.daisy)
      expect(stored?.habitat).toBe("Meadow")
    })

    it("throws NOT_FOUND when puzzle does not exist", async () => {
      const caller = createTestCaller()

      await expect(caller.puzzles.update(makeApiPuzzle({ id: TestPuzzleIds.daisy }))).rejects.toMatchObject({
        code: TrpcErrorCode.NOT_FOUND,
      })
    })
  })

  describe("delete", () => {
    it("deletes puzzle and returns success", async () => {
      const repo = new FakePuzzleRepository()
      await repo.create(makeDbPuzzle({ id: TestPuzzleIds.daisy }))
      const caller = createTestCaller(repo)

      const result = await caller.puzzles.delete(TestPuzzleIds.daisy)

      expect(result).toEqual({ success: true })
      expect(await repo.findById(TestPuzzleIds.daisy)).toBeUndefined()
    })

    it("throws NOT_FOUND when puzzle does not exist", async () => {
      const caller = createTestCaller()

      await expect(caller.puzzles.delete(TestPuzzleIds.daisy)).rejects.toMatchObject({
        code: TrpcErrorCode.NOT_FOUND,
      })
    })
  })
})
