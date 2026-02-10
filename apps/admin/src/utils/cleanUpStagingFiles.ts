import { BucketName, Millis, STAGING_PREFIX } from "@wortle/shared"

import { Clock } from "./clock"
import { serverLogger } from "./logger"
import { IBucketStorage } from "./R2BucketStorage"

const MAX_STAGING_AGE = Millis(24 * 60 * 60 * 1000)

export interface CleanUpResult {
  listed: number
  deleted: number
  skipped: number
}

export const cleanUpStagingFiles = async (
  storage: IBucketStorage,
  bucket: BucketName,
  clock: Clock,
): Promise<CleanUpResult> => {
  const objects = await storage.listObjects(bucket, STAGING_PREFIX)
  const now = clock.now()
  let deleted = 0
  let skipped = 0

  for (const obj of objects) {
    const age: Millis = Millis(now.getTime() - obj.uploaded.getTime())
    if (age > MAX_STAGING_AGE) {
      await storage.deleteObject(bucket, obj.key)
      serverLogger.info("cleanUp.staging", `Deleted expired staging file`, { key: obj.key, age })
      deleted++
    } else {
      skipped++
    }
  }

  return { listed: objects.length, deleted, skipped }
}
