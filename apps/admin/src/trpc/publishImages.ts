import { IMAGES_BUCKET, MediaType, ObjectKey, ORIGINALS_BUCKET } from "@wortle/shared"

import type { DbPuzzle } from "@/db/puzzleTypes"
import { imageMediaTypeExtension } from "@/utils/imageMediaType"
import { IMAGE_WIDTHS, processImage } from "@/utils/imageProcessor"
import { serverLogger } from "@/utils/logger"
import type { IBucketStorage } from "@/utils/R2BucketStorage"

const PUZZLES_PREFIX = "puzzles/"

const webpKey = (puzzleId: number, imageKey: string, width: number): ObjectKey =>
  ObjectKey(`${PUZZLES_PREFIX}${puzzleId}/${imageKey}-${width}.webp`)

interface SyncDirtyImagesParams {
  dirtyPuzzles: DbPuzzle[]
  bucketStorage: IBucketStorage
}

export const syncDirtyImages = async ({ dirtyPuzzles, bucketStorage }: SyncDirtyImagesParams): Promise<void> => {
  for (const puzzle of dirtyPuzzles) {
    for (const image of puzzle.images) {
      const ext = imageMediaTypeExtension(image.mediaType)
      const originalKey = ObjectKey(`${puzzle.id}/${image.imageKey}${ext}`)
      const sourceBuffer = await bucketStorage.getObject(ORIGINALS_BUCKET, originalKey)

      for (const width of IMAGE_WIDTHS) {
        const webp = await processImage(sourceBuffer, width)
        const key = webpKey(puzzle.id, image.imageKey, width)
        await bucketStorage.uploadBinary({
          bucket: IMAGES_BUCKET,
          key,
          body: webp,
          contentType: MediaType.IMAGE_WEBP,
        })
        serverLogger.info("publishImages.sync", `Uploaded ${key}`, {
          puzzleId: puzzle.id,
          imageKey: image.imageKey,
          width,
          bytes: webp.byteLength,
        })
      }
    }
  }
}

interface CleanupOrphanImagesParams {
  allPuzzles: DbPuzzle[]
  bucketStorage: IBucketStorage
}

export const cleanupOrphanImages = async ({ allPuzzles, bucketStorage }: CleanupOrphanImagesParams): Promise<void> => {
  const expectedKeys = new Set<string>()
  for (const puzzle of allPuzzles) {
    for (const image of puzzle.images) {
      for (const width of IMAGE_WIDTHS) {
        expectedKeys.add(webpKey(puzzle.id, image.imageKey, width))
      }
    }
  }

  const existingObjects = await bucketStorage.listObjects(IMAGES_BUCKET, PUZZLES_PREFIX)
  const orphanKeys = existingObjects.filter((obj) => !expectedKeys.has(obj.key)).map((obj) => obj.key)

  for (const key of orphanKeys) {
    await bucketStorage.deleteObject(IMAGES_BUCKET, key)
    serverLogger.info("publishImages.cleanup", `Deleted orphan ${key}`, { key })
  }
}
