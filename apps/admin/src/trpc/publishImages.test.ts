import { IMAGES_BUCKET, ImageKey, MediaType, ObjectKey } from "@wortle/shared"
import sharp from "sharp"
import { describe, expect, it } from "vitest"

import { FakeBucketStorage } from "@/utils/FakeBucketStorage.testUtils"
import { IMAGE_WIDTHS } from "@/utils/imageProcessor"

import { makeDbPuzzle } from "./testFactories.testUtils"

import { cleanupOrphanImages, syncDirtyImages } from "./publishImages"

describe("syncDirtyImages", () => {
  it("generates WebP variants for each image at all widths", async () => {
    const storage = new FakeBucketStorage()
    const puzzle = makeDbPuzzle()
    await storage.seedOriginalJpeg(puzzle.id, puzzle.images[0].imageKey)

    await syncDirtyImages({ dirtyPuzzles: [puzzle], bucketStorage: storage })

    for (const width of IMAGE_WIDTHS) {
      const key = ObjectKey(`puzzles/${puzzle.id}/whole-plant-${width}.webp`)
      const stored = storage.getStoredObject(IMAGES_BUCKET, key)
      expect(stored.contentType).toBe(MediaType.IMAGE_WEBP)

      const metadata = await sharp(Buffer.from(stored.body as ArrayBuffer)).metadata()
      expect(metadata.format).toBe("webp")
    }
  })

  it("handles multiple images per puzzle", async () => {
    const storage = new FakeBucketStorage()
    const puzzle = makeDbPuzzle({
      images: [
        { imageKey: ImageKey("whole-plant"), caption: "Whole plant", mediaType: MediaType.IMAGE_JPEG },
        { imageKey: ImageKey("close-up"), caption: "Close up", mediaType: MediaType.IMAGE_JPEG },
      ],
    })
    await storage.seedOriginalJpeg(puzzle.id, ImageKey("whole-plant"))
    await storage.seedOriginalJpeg(puzzle.id, ImageKey("close-up"))

    await syncDirtyImages({ dirtyPuzzles: [puzzle], bucketStorage: storage })

    const imagesObjects = await storage.listObjects(IMAGES_BUCKET, "puzzles/")
    expect(imagesObjects).toHaveLength(IMAGE_WIDTHS.length * 2)
  })

  it("skips processing when no dirty puzzles", async () => {
    const storage = new FakeBucketStorage()

    await syncDirtyImages({ dirtyPuzzles: [], bucketStorage: storage })

    const imagesObjects = await storage.listObjects(IMAGES_BUCKET, "puzzles/")
    expect(imagesObjects).toHaveLength(0)
  })
})

describe("cleanupOrphanImages", () => {
  it("deletes WebP files for puzzles that no longer exist", async () => {
    const storage = new FakeBucketStorage()
    const orphanKey = ObjectKey("puzzles/999/old-image-400.webp")
    await storage.uploadBinary({
      bucket: IMAGES_BUCKET,
      key: orphanKey,
      body: new ArrayBuffer(1),
      contentType: MediaType.IMAGE_WEBP,
    })

    await cleanupOrphanImages({ allPuzzles: [], bucketStorage: storage })

    const remaining = await storage.listObjects(IMAGES_BUCKET, "puzzles/")
    expect(remaining).toHaveLength(0)
  })

  it("preserves WebP files that match current puzzles", async () => {
    const storage = new FakeBucketStorage()
    const puzzle = makeDbPuzzle()
    for (const width of IMAGE_WIDTHS) {
      await storage.uploadBinary({
        bucket: IMAGES_BUCKET,
        key: ObjectKey(`puzzles/${puzzle.id}/whole-plant-${width}.webp`),
        body: new ArrayBuffer(1),
        contentType: MediaType.IMAGE_WEBP,
      })
    }

    await cleanupOrphanImages({ allPuzzles: [puzzle], bucketStorage: storage })

    const remaining = await storage.listObjects(IMAGES_BUCKET, "puzzles/")
    expect(remaining).toHaveLength(IMAGE_WIDTHS.length)
  })

  it("deletes orphans while preserving valid images", async () => {
    const storage = new FakeBucketStorage()
    const puzzle = makeDbPuzzle()
    const validKey = ObjectKey(`puzzles/${puzzle.id}/whole-plant-400.webp`)
    const orphanKey = ObjectKey("puzzles/999/deleted-image-400.webp")
    await storage.uploadBinary({
      bucket: IMAGES_BUCKET,
      key: validKey,
      body: new ArrayBuffer(1),
      contentType: MediaType.IMAGE_WEBP,
    })
    await storage.uploadBinary({
      bucket: IMAGES_BUCKET,
      key: orphanKey,
      body: new ArrayBuffer(1),
      contentType: MediaType.IMAGE_WEBP,
    })

    await cleanupOrphanImages({ allPuzzles: [puzzle], bucketStorage: storage })

    const remaining = await storage.listObjects(IMAGES_BUCKET, "puzzles/")
    expect(remaining).toHaveLength(1)
    expect(remaining[0].key).toBe(validKey)
  })
})
