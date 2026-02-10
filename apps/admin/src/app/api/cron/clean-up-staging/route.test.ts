import { ObjectKey, ORIGINALS_BUCKET, STAGING_PREFIX } from "@wortle/shared"
import { describe, expect, it } from "vitest"

import { FakeBucketStorage } from "@/utils/FakeBucketStorage.testUtils"
import { HttpStatus } from "@/utils/httpStatus"
import { FIXED_TIME, fixedClock } from "@/utils/testConstants.testUtils"

import { createCleanUpStagingHandler } from "./cleanUpStagingHandler"

const CRON_SECRET = "test-cron-secret"

const cronRequest = (authHeader?: string) => {
  const headers = new Headers()
  if (authHeader !== undefined) {
    headers.set("authorization", authHeader)
  }
  return new Request("http://localhost/api/cron/clean-up-staging", { method: "GET", headers })
}

describe("clean-up-staging route", () => {
  it("returns 401 when auth header is missing", async () => {
    const storage = new FakeBucketStorage(fixedClock)
    const handler = createCleanUpStagingHandler(storage, ORIGINALS_BUCKET, fixedClock, CRON_SECRET)

    const response = await handler(cronRequest())

    expect(response.status).toBe(HttpStatus.UNAUTHORIZED)
    expect(await response.json()).toEqual({ error: "Unauthorized" })
  })

  it("returns 401 when auth header is wrong", async () => {
    const storage = new FakeBucketStorage(fixedClock)
    const handler = createCleanUpStagingHandler(storage, ORIGINALS_BUCKET, fixedClock, CRON_SECRET)

    const response = await handler(cronRequest("Bearer wrong-secret"))

    expect(response.status).toBe(HttpStatus.UNAUTHORIZED)
    expect(await response.json()).toEqual({ error: "Unauthorized" })
  })

  it("returns 200 with cleanup result when auth is valid", async () => {
    const storage = new FakeBucketStorage(fixedClock)
    const key = ObjectKey(`${STAGING_PREFIX}old-file.jpg`)
    storage.seedStagingFileAt(key, new Date(FIXED_TIME.getTime() - 25 * 60 * 60 * 1000))
    const handler = createCleanUpStagingHandler(storage, ORIGINALS_BUCKET, fixedClock, CRON_SECRET)

    const response = await handler(cronRequest(`Bearer ${CRON_SECRET}`))

    expect(response.status).toBe(HttpStatus.OK)
    expect(await response.json()).toEqual({ listed: 1, deleted: 1, skipped: 0 })
  })

  it("returns 200 with empty result when no files exist", async () => {
    const storage = new FakeBucketStorage(fixedClock)
    const handler = createCleanUpStagingHandler(storage, ORIGINALS_BUCKET, fixedClock, CRON_SECRET)

    const response = await handler(cronRequest(`Bearer ${CRON_SECRET}`))

    expect(response.status).toBe(HttpStatus.OK)
    expect(await response.json()).toEqual({ listed: 0, deleted: 0, skipped: 0 })
  })
})
