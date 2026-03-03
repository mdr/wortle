import { ImageKey, ObjectKey, ORIGINALS_BUCKET, TaxonId, TestPuzzleIds, TestTaxonIds } from "@wortle/shared"
import { describe, expect, it } from "vitest"

import { FakePuzzleRepository } from "@/db/FakePuzzleRepository.testUtils"
import { FakeTaxaRepository } from "@/db/FakeTaxaRepository.testUtils"
import { FakeBucketStorage } from "@/utils/FakeBucketStorage.testUtils"

import { TrpcErrorCode } from "./errorCodes"
import { router } from "./init"
import { createPuzzleRouter } from "./puzzleRouter"
import {
  makeApiPuzzle,
  makeDbPuzzle,
  makeDbTaxon,
  makeCreatePuzzleRequest,
  makeEditPuzzleRequest,
  makePuzzleRequestImage,
  testContext,
} from "./testFactories.testUtils"

const createTestCaller = (
  puzzleRepository = new FakePuzzleRepository(),
  taxaRepository = new FakeTaxaRepository(),
  bucketStorage = new FakeBucketStorage(),
) => {
  const puzzleRouter = createPuzzleRouter({
    puzzleRepository,
    taxaRepository,
    bucketStorage,
    originalsBucketName: ORIGINALS_BUCKET,
  })
  const testRouter = router({ puzzles: puzzleRouter })
  return testRouter.createCaller(testContext)
}

const createTaxaRepo = async () => {
  const repo = new FakeTaxaRepository()
  await repo.create(makeDbTaxon({ id: TestTaxonIds.daisy }))
  return repo
}

const stagingKey = ObjectKey("staging/abc.jpg")

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
      const puzzle = makeDbPuzzle()
      await repo.create(puzzle)
      const caller = createTestCaller(repo)

      const result = await caller.puzzles.get(puzzle.id)

      expect(result).toEqual(makeApiPuzzle())
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
      const puzzleRepo = new FakePuzzleRepository()
      const taxaRepo = await createTaxaRepo()
      const caller = createTestCaller(puzzleRepo, taxaRepo)
      const request = makeCreatePuzzleRequest()

      const result = await caller.puzzles.create(request)

      expect(result).toEqual(makeApiPuzzle())
      expect(await puzzleRepo.findById(request.id)).toBeDefined()
    })

    it("promotes staged images to final location on create", async () => {
      const puzzleRepo = new FakePuzzleRepository()
      const taxaRepo = await createTaxaRepo()
      const storage = new FakeBucketStorage()
      await storage.seedStagingFile(stagingKey)
      const caller = createTestCaller(puzzleRepo, taxaRepo, storage)
      const request = makeCreatePuzzleRequest({
        images: [makePuzzleRequestImage({ stagingKey })],
      })

      await caller.puzzles.create(request)

      const finalKey = ObjectKey(`${request.id}/whole-plant.jpg`)
      expect(storage.objects.has(`${ORIGINALS_BUCKET}/${finalKey}`)).toBe(true)
      expect(storage.objects.has(`${ORIGINALS_BUCKET}/${stagingKey}`)).toBe(false)
    })

    it("does not promote images without stagingKey", async () => {
      const puzzleRepo = new FakePuzzleRepository()
      const taxaRepo = await createTaxaRepo()
      const storage = new FakeBucketStorage()
      const caller = createTestCaller(puzzleRepo, taxaRepo, storage)
      const request = makeCreatePuzzleRequest({
        images: [makePuzzleRequestImage({ stagingKey: undefined })],
      })

      await caller.puzzles.create(request)

      expect(storage.objects.size).toBe(0)
    })

    it("rejects when staged image is missing from storage", async () => {
      const puzzleRepo = new FakePuzzleRepository()
      const taxaRepo = await createTaxaRepo()
      const storage = new FakeBucketStorage()
      const caller = createTestCaller(puzzleRepo, taxaRepo, storage)
      const request = makeCreatePuzzleRequest({
        images: [makePuzzleRequestImage({ stagingKey })],
      })

      await expect(caller.puzzles.create(request)).rejects.toMatchObject({
        code: TrpcErrorCode.UNPROCESSABLE_CONTENT,
        message: `Staged image not found: ${stagingKey}`,
      })
      expect(await puzzleRepo.findById(request.id)).toBeUndefined()
    })

    it("throws UNPROCESSABLE_CONTENT when puzzle already exists", async () => {
      const puzzleRepo = new FakePuzzleRepository()
      const taxaRepo = await createTaxaRepo()
      await puzzleRepo.create(makeDbPuzzle())
      const caller = createTestCaller(puzzleRepo, taxaRepo)

      await expect(caller.puzzles.create(makeCreatePuzzleRequest())).rejects.toMatchObject({
        code: TrpcErrorCode.UNPROCESSABLE_CONTENT,
      })
    })

    it("throws UNPROCESSABLE_CONTENT when taxon does not exist", async () => {
      const caller = createTestCaller()
      const request = makeCreatePuzzleRequest({ speciesId: TaxonId("nonexistent") })

      await expect(caller.puzzles.create(request)).rejects.toMatchObject({
        code: TrpcErrorCode.UNPROCESSABLE_CONTENT,
        message: 'Taxon "nonexistent" does not exist',
      })
    })
  })

  describe("update", () => {
    it("updates puzzle and returns it", async () => {
      const puzzleRepo = new FakePuzzleRepository()
      const taxaRepo = await createTaxaRepo()
      const puzzle = makeDbPuzzle()
      await puzzleRepo.create(puzzle)
      const caller = createTestCaller(puzzleRepo, taxaRepo)
      const request = makeEditPuzzleRequest({ habitat: "Meadow" })

      const result = await caller.puzzles.update(request)

      expect(result).toEqual(makeApiPuzzle({ habitat: "Meadow" }))
      const stored = await puzzleRepo.findById(puzzle.id)
      expect(stored?.habitat).toBe("Meadow")
    })

    it("promotes staged images to final location on update", async () => {
      const puzzleRepo = new FakePuzzleRepository()
      const taxaRepo = await createTaxaRepo()
      const puzzle = makeDbPuzzle()
      await puzzleRepo.create(puzzle)
      const storage = new FakeBucketStorage()
      await storage.seedStagingFile(stagingKey)
      const caller = createTestCaller(puzzleRepo, taxaRepo, storage)
      const request = makeEditPuzzleRequest({
        images: [makePuzzleRequestImage({ imageKey: ImageKey("close-up"), stagingKey })],
      })

      await caller.puzzles.update(request)

      const finalKey = ObjectKey(`${puzzle.id}/close-up.jpg`)
      expect(storage.objects.has(`${ORIGINALS_BUCKET}/${finalKey}`)).toBe(true)
      expect(storage.objects.has(`${ORIGINALS_BUCKET}/${stagingKey}`)).toBe(false)
    })

    it("throws NOT_FOUND when puzzle does not exist", async () => {
      const taxaRepo = await createTaxaRepo()
      const caller = createTestCaller(new FakePuzzleRepository(), taxaRepo)

      await expect(caller.puzzles.update(makeEditPuzzleRequest())).rejects.toMatchObject({
        code: TrpcErrorCode.NOT_FOUND,
      })
    })

    it("throws UNPROCESSABLE_CONTENT when taxon does not exist", async () => {
      const puzzleRepo = new FakePuzzleRepository()
      const puzzle = makeDbPuzzle()
      await puzzleRepo.create(puzzle)
      const caller = createTestCaller(puzzleRepo)
      const request = makeEditPuzzleRequest({ speciesId: TaxonId("nonexistent") })

      await expect(caller.puzzles.update(request)).rejects.toMatchObject({
        code: TrpcErrorCode.UNPROCESSABLE_CONTENT,
        message: 'Taxon "nonexistent" does not exist',
      })
    })
  })

  describe("delete", () => {
    it("deletes puzzle and returns success", async () => {
      const repo = new FakePuzzleRepository()
      const puzzle = makeDbPuzzle()
      await repo.create(puzzle)
      const caller = createTestCaller(repo)

      const result = await caller.puzzles.delete(puzzle.id)

      expect(result).toEqual({ success: true })
      expect(await repo.findById(puzzle.id)).toBeUndefined()
    })

    it("throws NOT_FOUND when puzzle does not exist", async () => {
      const caller = createTestCaller()

      await expect(caller.puzzles.delete(TestPuzzleIds.daisy)).rejects.toMatchObject({
        code: TrpcErrorCode.NOT_FOUND,
      })
    })
  })
})
