import { CommonName, TestPuzzleIds, TestTaxonIds } from "@wortle/shared"
import { describe, expect, it } from "vitest"

import { FakePuzzleRepository } from "@/db/FakePuzzleRepository.testUtils"
import { FakeTaxaRepository } from "@/db/FakeTaxaRepository.testUtils"

import { TrpcErrorCode } from "./errorCodes"
import { router } from "./init"
import { createTaxaRouter } from "./taxaRouter"
import { makeApiTaxon, makeDbPuzzle, makeDbTaxon, testContext } from "./testFactories.testUtils"

const createTestCaller = (taxaRepository = new FakeTaxaRepository(), puzzleRepository = new FakePuzzleRepository()) => {
  const taxaRouter = createTaxaRouter(taxaRepository, puzzleRepository)
  const testRouter = router({ taxa: taxaRouter })
  return testRouter.createCaller(testContext)
}

describe("taxaRouter", () => {
  describe("list", () => {
    it("returns empty array when no taxa exist", async () => {
      const caller = createTestCaller()

      const result = await caller.taxa.list()

      expect(result).toEqual([])
    })

    it("returns all taxa", async () => {
      const repo = new FakeTaxaRepository()
      await repo.create(makeDbTaxon({ id: TestTaxonIds.daisy }))
      await repo.create(makeDbTaxon({ id: TestTaxonIds.tansy }))
      const caller = createTestCaller(repo)

      const result = await caller.taxa.list()

      expect(result.map((s) => s.id)).toIncludeSameMembers([TestTaxonIds.daisy, TestTaxonIds.tansy])
    })
  })

  describe("get", () => {
    it("returns taxon when it exists", async () => {
      const repo = new FakeTaxaRepository()
      await repo.create(makeDbTaxon({ id: TestTaxonIds.daisy }))
      const caller = createTestCaller(repo)

      const result = await caller.taxa.get(TestTaxonIds.daisy)

      expect(result).toEqual(makeApiTaxon({ id: TestTaxonIds.daisy }))
    })

    it("throws NOT_FOUND when taxon does not exist", async () => {
      const caller = createTestCaller()

      await expect(caller.taxa.get(TestTaxonIds.daisy)).rejects.toMatchObject({
        code: TrpcErrorCode.NOT_FOUND,
      })
    })
  })

  describe("create", () => {
    it("creates taxon and returns it", async () => {
      const repo = new FakeTaxaRepository()
      const caller = createTestCaller(repo)
      const taxon = makeApiTaxon({ id: TestTaxonIds.daisy })

      const result = await caller.taxa.create(taxon)

      expect(result).toEqual(taxon)
      expect(await repo.findById(TestTaxonIds.daisy)).toBeDefined()
    })

    it("throws UNPROCESSABLE_CONTENT when taxon already exists", async () => {
      const repo = new FakeTaxaRepository()
      await repo.create(makeDbTaxon({ id: TestTaxonIds.daisy }))
      const caller = createTestCaller(repo)

      await expect(caller.taxa.create(makeApiTaxon({ id: TestTaxonIds.daisy }))).rejects.toMatchObject({
        code: TrpcErrorCode.UNPROCESSABLE_CONTENT,
      })
    })
  })

  describe("update", () => {
    it("updates taxon and returns it", async () => {
      const repo = new FakeTaxaRepository()
      await repo.create(makeDbTaxon({ id: TestTaxonIds.daisy }))
      const caller = createTestCaller(repo)
      const updated = makeApiTaxon({ id: TestTaxonIds.daisy, commonName: CommonName("Common Daisy") })

      const result = await caller.taxa.update(updated)

      expect(result).toEqual(updated)
      const stored = await repo.findById(TestTaxonIds.daisy)
      expect(stored?.commonName).toBe("Common Daisy")
    })

    it("throws NOT_FOUND when taxon does not exist", async () => {
      const caller = createTestCaller()

      await expect(caller.taxa.update(makeApiTaxon({ id: TestTaxonIds.daisy }))).rejects.toMatchObject({
        code: TrpcErrorCode.NOT_FOUND,
      })
    })
  })

  describe("delete", () => {
    it("deletes taxon and returns success", async () => {
      const taxaRepo = new FakeTaxaRepository()
      await taxaRepo.create(makeDbTaxon({ id: TestTaxonIds.daisy }))
      const caller = createTestCaller(taxaRepo)

      const result = await caller.taxa.delete(TestTaxonIds.daisy)

      expect(result).toEqual({ success: true })
      expect(await taxaRepo.findById(TestTaxonIds.daisy)).toBeUndefined()
    })

    it("throws NOT_FOUND when taxon does not exist", async () => {
      const caller = createTestCaller()

      await expect(caller.taxa.delete(TestTaxonIds.daisy)).rejects.toMatchObject({
        code: TrpcErrorCode.NOT_FOUND,
      })
    })

    it("throws UNPROCESSABLE_CONTENT when a puzzle references the taxon", async () => {
      const taxaRepo = new FakeTaxaRepository()
      const puzzleRepo = new FakePuzzleRepository()
      await taxaRepo.create(makeDbTaxon({ id: TestTaxonIds.daisy }))
      await puzzleRepo.create(makeDbPuzzle({ id: TestPuzzleIds.daisy, speciesId: TestTaxonIds.daisy }))
      const caller = createTestCaller(taxaRepo, puzzleRepo)

      await expect(caller.taxa.delete(TestTaxonIds.daisy)).rejects.toMatchObject({
        code: TrpcErrorCode.UNPROCESSABLE_CONTENT,
        message: "Cannot delete taxon: 1 puzzle references it",
      })
    })
  })
})
