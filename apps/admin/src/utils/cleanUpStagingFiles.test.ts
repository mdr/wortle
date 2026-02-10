import { ObjectKey, ORIGINALS_BUCKET, STAGING_PREFIX } from "@wortle/shared"
import { describe, expect, it } from "vitest"

import { FakeBucketStorage } from "@/utils/FakeBucketStorage.testUtils"
import { FIXED_TIME, fixedClock } from "@/utils/testConstants.testUtils"

import { cleanUpStagingFiles } from "./cleanUpStagingFiles"

const hours = (n: number) => n * 60 * 60 * 1000

const hoursAgo = (n: number) => new Date(FIXED_TIME.getTime() - hours(n))

describe("cleanUpStagingFiles", () => {
  it("deletes staging files older than 24h", async () => {
    const storage = new FakeBucketStorage(fixedClock)
    const key = ObjectKey(`${STAGING_PREFIX}old-file.jpg`)
    storage.seedStagingFileAt(key, hoursAgo(25))

    const result = await cleanUpStagingFiles(storage, ORIGINALS_BUCKET, fixedClock)

    expect(result).toEqual({ listed: 1, deleted: 1, skipped: 0 })
    expect(storage.objects.size).toBe(0)
  })

  it("keeps staging files younger than 24h", async () => {
    const storage = new FakeBucketStorage(fixedClock)
    const key = ObjectKey(`${STAGING_PREFIX}recent-file.jpg`)
    storage.seedStagingFileAt(key, hoursAgo(12))

    const result = await cleanUpStagingFiles(storage, ORIGINALS_BUCKET, fixedClock)

    expect(result).toEqual({ listed: 1, deleted: 0, skipped: 1 })
    expect(storage.objects.size).toBe(1)
  })

  it("handles empty staging prefix", async () => {
    const storage = new FakeBucketStorage(fixedClock)

    const result = await cleanUpStagingFiles(storage, ORIGINALS_BUCKET, fixedClock)

    expect(result).toEqual({ listed: 0, deleted: 0, skipped: 0 })
  })

  it("only deletes expired files in mixed-age set", async () => {
    const storage = new FakeBucketStorage(fixedClock)
    const oldKey = ObjectKey(`${STAGING_PREFIX}old.jpg`)
    const recentKey = ObjectKey(`${STAGING_PREFIX}recent.jpg`)
    storage.seedStagingFileAt(oldKey, hoursAgo(48))
    storage.seedStagingFileAt(recentKey, hoursAgo(6))

    const result = await cleanUpStagingFiles(storage, ORIGINALS_BUCKET, fixedClock)

    expect(result).toEqual({ listed: 2, deleted: 1, skipped: 1 })
    expect(storage.objects.has(`${ORIGINALS_BUCKET}/${oldKey}`)).toBe(false)
    expect(storage.objects.has(`${ORIGINALS_BUCKET}/${recentKey}`)).toBe(true)
  })

  it("ignores non-staging files", async () => {
    const storage = new FakeBucketStorage(fixedClock)
    const stagingKey = ObjectKey(`${STAGING_PREFIX}old.jpg`)
    const puzzleKey = ObjectKey("42/whole-plant.jpg")
    storage.seedStagingFileAt(stagingKey, hoursAgo(25))
    storage.seedStagingFileAt(puzzleKey, hoursAgo(100))

    const result = await cleanUpStagingFiles(storage, ORIGINALS_BUCKET, fixedClock)

    expect(result).toEqual({ listed: 1, deleted: 1, skipped: 0 })
    expect(storage.objects.has(`${ORIGINALS_BUCKET}/${puzzleKey}`)).toBe(true)
  })
})
