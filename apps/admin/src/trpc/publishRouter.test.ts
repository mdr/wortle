import {
  ImageKey,
  IMAGES_BUCKET,
  MediaType,
  ObjectKey,
  ORIGINALS_BUCKET,
  PUZZLES_DATA_KEY,
  ScientificName,
  SPECIES_DATA_BUCKET,
  SPECIES_DATA_KEY,
  speciesDataJsonSchema,
  puzzlesDataJsonSchema,
  TestPuzzleIds,
  TestSpeciesIds,
} from "@wortle/shared"
import { describe, expect, it } from "vitest"

import { FakePuzzleRepository } from "@/db/FakePuzzleRepository.testUtils"
import { FakeScheduleRepository } from "@/db/FakeScheduleRepository.testUtils"
import { FakeSpeciesRepository } from "@/db/FakeSpeciesRepository.testUtils"
import { FakeBucketStorage } from "@/utils/FakeBucketStorage.testUtils"
import { IMAGE_WIDTHS } from "@/utils/imageProcessor"

import { router } from "./init"
import { createPublishRouter } from "./publishRouter"
import { makeDbPuzzle, makeDbSpecies, testContext } from "./testFactories.testUtils"

const createTestCaller = (
  speciesRepository: FakeSpeciesRepository,
  puzzleRepository: FakePuzzleRepository,
  bucketStorage: FakeBucketStorage,
  scheduleRepository: FakeScheduleRepository = new FakeScheduleRepository(),
) => {
  const publishRouter = createPublishRouter({
    speciesRepository,
    puzzleRepository,
    scheduleRepository,
    bucketStorage,
    dataBucketName: SPECIES_DATA_BUCKET,
    originalsBucketName: ORIGINALS_BUCKET,
    imagesBucketName: IMAGES_BUCKET,
  })
  const testRouter = router({ publish: publishRouter })
  return testRouter.createCaller(testContext)
}

describe("publishRouter", () => {
  describe("all", () => {
    it("publishes species data to R2 sorted by scientific name", async () => {
      const speciesRepo = new FakeSpeciesRepository()
      await speciesRepo.create(
        makeDbSpecies({ id: TestSpeciesIds.tansy, scientificName: ScientificName("Tanacetum vulgare") }),
      )
      await speciesRepo.create(
        makeDbSpecies({ id: TestSpeciesIds.daisy, scientificName: ScientificName("Bellis perennis") }),
      )
      await speciesRepo.create(
        makeDbSpecies({ id: TestSpeciesIds.herbRobert, scientificName: ScientificName("Geranium robertianum") }),
      )
      const puzzleRepo = new FakePuzzleRepository()
      const bucketStorage = new FakeBucketStorage()
      const caller = createTestCaller(speciesRepo, puzzleRepo, bucketStorage)

      const result = await caller.publish.all()

      expect(result).toEqual({ success: true, speciesCount: 3, puzzleCount: 0, scheduleEntryCount: 0 })
      const uploadedBody = speciesDataJsonSchema.parse(bucketStorage.getJson(SPECIES_DATA_BUCKET, SPECIES_DATA_KEY))
      expect(uploadedBody.species.map((s) => s.id)).toEqual([
        TestSpeciesIds.daisy,
        TestSpeciesIds.herbRobert,
        TestSpeciesIds.tansy,
      ])
    })

    it("publishes empty species array when no species exist", async () => {
      const speciesRepo = new FakeSpeciesRepository()
      const puzzleRepo = new FakePuzzleRepository()
      const bucketStorage = new FakeBucketStorage()
      const caller = createTestCaller(speciesRepo, puzzleRepo, bucketStorage)

      const result = await caller.publish.all()

      expect(result).toEqual({ success: true, speciesCount: 0, puzzleCount: 0, scheduleEntryCount: 0 })
      const uploadedBody = speciesDataJsonSchema.parse(bucketStorage.getJson(SPECIES_DATA_BUCKET, SPECIES_DATA_KEY))
      expect(uploadedBody.species).toEqual([])
    })

    it("publishes puzzles data sorted by id", async () => {
      const speciesRepo = new FakeSpeciesRepository()
      const puzzleRepo = new FakePuzzleRepository()
      const bucketStorage = new FakeBucketStorage()
      const puzzle1 = makeDbPuzzle({ id: TestPuzzleIds.herbRobert })
      const puzzle2 = makeDbPuzzle({ id: TestPuzzleIds.daisy })
      await puzzleRepo.create(puzzle1)
      await puzzleRepo.create(puzzle2)
      await bucketStorage.seedOriginalJpeg(puzzle1.id, puzzle1.images[0].imageKey)
      await bucketStorage.seedOriginalJpeg(puzzle2.id, puzzle2.images[0].imageKey)
      const caller = createTestCaller(speciesRepo, puzzleRepo, bucketStorage)

      const result = await caller.publish.all()

      expect(result.puzzleCount).toBe(2)
      const uploadedBody = puzzlesDataJsonSchema.parse(bucketStorage.getJson(SPECIES_DATA_BUCKET, PUZZLES_DATA_KEY))
      expect(uploadedBody.puzzles.map((p) => p.id)).toEqual([TestPuzzleIds.daisy, TestPuzzleIds.herbRobert])
    })

    it("generates WebP variants for dirty puzzles", async () => {
      const speciesRepo = new FakeSpeciesRepository()
      const puzzleRepo = new FakePuzzleRepository()
      const bucketStorage = new FakeBucketStorage()
      const puzzle = makeDbPuzzle()
      await puzzleRepo.create(puzzle)
      await bucketStorage.seedOriginalJpeg(puzzle.id, puzzle.images[0].imageKey)
      const caller = createTestCaller(speciesRepo, puzzleRepo, bucketStorage)

      await caller.publish.all()

      for (const width of IMAGE_WIDTHS) {
        const key = ObjectKey(`puzzles/${puzzle.id}/whole-plant-${width}.webp`)
        const stored = bucketStorage.getStoredObject(IMAGES_BUCKET, key)
        expect(stored.contentType).toBe(MediaType.IMAGE_WEBP)
      }
    })

    it("marks puzzles as synced after processing", async () => {
      const speciesRepo = new FakeSpeciesRepository()
      const puzzleRepo = new FakePuzzleRepository()
      const bucketStorage = new FakeBucketStorage()
      const puzzle = makeDbPuzzle()
      await puzzleRepo.create(puzzle)
      await bucketStorage.seedOriginalJpeg(puzzle.id, puzzle.images[0].imageKey)
      const caller = createTestCaller(speciesRepo, puzzleRepo, bucketStorage)

      await caller.publish.all()

      const statuses = await puzzleRepo.listWithSyncStatus()
      expect(statuses[0].imagesSynced).toBe(true)
    })

    it("skips WebP generation for already-synced puzzles", async () => {
      const speciesRepo = new FakeSpeciesRepository()
      const puzzleRepo = new FakePuzzleRepository()
      const bucketStorage = new FakeBucketStorage()
      const puzzle = makeDbPuzzle()
      await puzzleRepo.create(puzzle)
      await bucketStorage.seedOriginalJpeg(puzzle.id, puzzle.images[0].imageKey)
      const caller = createTestCaller(speciesRepo, puzzleRepo, bucketStorage)

      await caller.publish.all()

      const objectCountAfterFirstPublish = bucketStorage.objects.size

      await caller.publish.all()

      expect(bucketStorage.objects.size).toBe(objectCountAfterFirstPublish)
    })

    it("strips mediaType from puzzle images in published JSON", async () => {
      const speciesRepo = new FakeSpeciesRepository()
      const puzzleRepo = new FakePuzzleRepository()
      const bucketStorage = new FakeBucketStorage()
      const puzzle = makeDbPuzzle({
        images: [{ imageKey: ImageKey("flower"), caption: "A flower", mediaType: MediaType.IMAGE_JPEG }],
      })
      await puzzleRepo.create(puzzle)
      await bucketStorage.seedOriginalJpeg(puzzle.id, ImageKey("flower"))
      const caller = createTestCaller(speciesRepo, puzzleRepo, bucketStorage)

      await caller.publish.all()

      const uploadedBody = puzzlesDataJsonSchema.parse(bucketStorage.getJson(SPECIES_DATA_BUCKET, PUZZLES_DATA_KEY))
      expect(uploadedBody.puzzles[0].images[0]).toEqual({ imageKey: ImageKey("flower"), caption: "A flower" })
    })

    it("cleans up orphan WebP images", async () => {
      const speciesRepo = new FakeSpeciesRepository()
      const puzzleRepo = new FakePuzzleRepository()
      const bucketStorage = new FakeBucketStorage()
      const orphanKey = ObjectKey("puzzles/999/old-image-400.webp")
      await bucketStorage.uploadBinary({
        bucket: IMAGES_BUCKET,
        key: orphanKey,
        body: new ArrayBuffer(1),
        contentType: MediaType.IMAGE_WEBP,
      })
      const caller = createTestCaller(speciesRepo, puzzleRepo, bucketStorage)

      await caller.publish.all()

      const remaining = await bucketStorage.listObjects(IMAGES_BUCKET, "puzzles/")
      expect(remaining).toHaveLength(0)
    })
  })
})
