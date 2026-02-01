import { CommonName, TestPuzzleIds, TestSpeciesIds } from "@wortle/shared"
import { describe, expect, it } from "vitest"

import { FakePuzzleRepository } from "@/db/FakePuzzleRepository.testUtils"
import { FakeSpeciesRepository } from "@/db/FakeSpeciesRepository.testUtils"

import { TrpcErrorCode } from "./errorCodes"
import { router } from "./init"
import { createSpeciesRouter } from "./speciesRouter"
import { makeApiSpecies, makeDbPuzzle, makeDbSpecies, testContext } from "./testFactories.testUtils"

const createTestCaller = (
  speciesRepository = new FakeSpeciesRepository(),
  puzzleRepository = new FakePuzzleRepository(),
) => {
  const speciesRouter = createSpeciesRouter(speciesRepository, puzzleRepository)
  const testRouter = router({ species: speciesRouter })
  return testRouter.createCaller(testContext)
}

describe("speciesRouter", () => {
  describe("list", () => {
    it("returns empty array when no species exist", async () => {
      const caller = createTestCaller()

      const result = await caller.species.list()

      expect(result).toEqual([])
    })

    it("returns all species", async () => {
      const repo = new FakeSpeciesRepository()
      await repo.create(makeDbSpecies({ id: TestSpeciesIds.daisy }))
      await repo.create(makeDbSpecies({ id: TestSpeciesIds.tansy }))
      const caller = createTestCaller(repo)

      const result = await caller.species.list()

      expect(result.map((s) => s.id)).toIncludeSameMembers([TestSpeciesIds.daisy, TestSpeciesIds.tansy])
    })
  })

  describe("get", () => {
    it("returns species when it exists", async () => {
      const repo = new FakeSpeciesRepository()
      await repo.create(makeDbSpecies({ id: TestSpeciesIds.daisy }))
      const caller = createTestCaller(repo)

      const result = await caller.species.get(TestSpeciesIds.daisy)

      expect(result).toEqual(makeApiSpecies({ id: TestSpeciesIds.daisy }))
    })

    it("throws NOT_FOUND when species does not exist", async () => {
      const caller = createTestCaller()

      await expect(caller.species.get(TestSpeciesIds.daisy)).rejects.toMatchObject({
        code: TrpcErrorCode.NOT_FOUND,
      })
    })
  })

  describe("create", () => {
    it("creates species and returns it", async () => {
      const repo = new FakeSpeciesRepository()
      const caller = createTestCaller(repo)
      const species = makeApiSpecies({ id: TestSpeciesIds.daisy })

      const result = await caller.species.create(species)

      expect(result).toEqual(species)
      expect(await repo.findById(TestSpeciesIds.daisy)).toBeDefined()
    })

    it("throws UNPROCESSABLE_CONTENT when species already exists", async () => {
      const repo = new FakeSpeciesRepository()
      await repo.create(makeDbSpecies({ id: TestSpeciesIds.daisy }))
      const caller = createTestCaller(repo)

      await expect(caller.species.create(makeApiSpecies({ id: TestSpeciesIds.daisy }))).rejects.toMatchObject({
        code: TrpcErrorCode.UNPROCESSABLE_CONTENT,
      })
    })
  })

  describe("update", () => {
    it("updates species and returns it", async () => {
      const repo = new FakeSpeciesRepository()
      await repo.create(makeDbSpecies({ id: TestSpeciesIds.daisy }))
      const caller = createTestCaller(repo)
      const updated = makeApiSpecies({ id: TestSpeciesIds.daisy, commonName: CommonName("Common Daisy") })

      const result = await caller.species.update(updated)

      expect(result).toEqual(updated)
      const stored = await repo.findById(TestSpeciesIds.daisy)
      expect(stored?.commonName).toBe("Common Daisy")
    })

    it("throws NOT_FOUND when species does not exist", async () => {
      const caller = createTestCaller()

      await expect(caller.species.update(makeApiSpecies({ id: TestSpeciesIds.daisy }))).rejects.toMatchObject({
        code: TrpcErrorCode.NOT_FOUND,
      })
    })
  })

  describe("delete", () => {
    it("deletes species and returns success", async () => {
      const speciesRepo = new FakeSpeciesRepository()
      await speciesRepo.create(makeDbSpecies({ id: TestSpeciesIds.daisy }))
      const caller = createTestCaller(speciesRepo)

      const result = await caller.species.delete(TestSpeciesIds.daisy)

      expect(result).toEqual({ success: true })
      expect(await speciesRepo.findById(TestSpeciesIds.daisy)).toBeUndefined()
    })

    it("throws NOT_FOUND when species does not exist", async () => {
      const caller = createTestCaller()

      await expect(caller.species.delete(TestSpeciesIds.daisy)).rejects.toMatchObject({
        code: TrpcErrorCode.NOT_FOUND,
      })
    })

    it("throws UNPROCESSABLE_CONTENT when a puzzle references the species", async () => {
      const speciesRepo = new FakeSpeciesRepository()
      const puzzleRepo = new FakePuzzleRepository()
      await speciesRepo.create(makeDbSpecies({ id: TestSpeciesIds.daisy }))
      await puzzleRepo.create(makeDbPuzzle({ id: TestPuzzleIds.daisy, speciesId: TestSpeciesIds.daisy }))
      const caller = createTestCaller(speciesRepo, puzzleRepo)

      await expect(caller.species.delete(TestSpeciesIds.daisy)).rejects.toMatchObject({
        code: TrpcErrorCode.UNPROCESSABLE_CONTENT,
        message: "Cannot delete species: 1 puzzle references it",
      })
    })
  })
})
