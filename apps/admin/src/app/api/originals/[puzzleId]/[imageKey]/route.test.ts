import { ObjectKey, ORIGINALS_BUCKET } from "@wortle/shared"
import { describe, expect, it } from "vitest"

import { FakeBucketStorage } from "@/utils/FakeBucketStorage.testUtils"
import { HttpStatus } from "@/utils/httpStatus"
import { MediaType } from "@/utils/R2BucketStorage"
import { JPEG_HEADER } from "@/utils/testConstants.testUtils"

import { createOriginalsHandler } from "./originalsHandler"

const originalsRequest = (puzzleId: string, imageKey: string) => ({
  request: new Request(`http://localhost/api/originals/${puzzleId}/${imageKey}`),
  params: Promise.resolve({ puzzleId, imageKey }),
})

describe("originals route", () => {
  it("returns JPEG from originals bucket", async () => {
    const storage = new FakeBucketStorage()
    await storage.uploadBinary({
      bucket: ORIGINALS_BUCKET,
      key: ObjectKey("40/whole-plant.jpg"),
      body: JPEG_HEADER,
      contentType: MediaType.IMAGE_JPEG,
    })
    const handler = createOriginalsHandler(storage)
    const { request, params } = originalsRequest("40", "whole-plant.jpg")

    const response = await handler(request, { params })

    expect(response.status).toBe(HttpStatus.OK)
    expect(response.headers.get("Content-Type")).toBe("image/jpeg")
    const body = new Uint8Array(await response.arrayBuffer())
    expect(body).toEqual(new Uint8Array(JPEG_HEADER))
  })

  it("returns HEIC from originals bucket with correct content type", async () => {
    const storage = new FakeBucketStorage()
    await storage.uploadBinary({
      bucket: ORIGINALS_BUCKET,
      key: ObjectKey("40/close-up.heic"),
      body: JPEG_HEADER,
      contentType: MediaType.IMAGE_HEIC,
    })
    const handler = createOriginalsHandler(storage)
    const { request, params } = originalsRequest("40", "close-up.heic")

    const response = await handler(request, { params })

    expect(response.status).toBe(HttpStatus.OK)
    expect(response.headers.get("Content-Type")).toBe("image/heic")
  })

  it("returns 404 when image does not exist", async () => {
    const storage = new FakeBucketStorage()
    const handler = createOriginalsHandler(storage)
    const { request, params } = originalsRequest("99", "missing.jpg")

    const response = await handler(request, { params })

    expect(response.status).toBe(HttpStatus.NOT_FOUND)
    expect(await response.json()).toEqual({ error: "Image not found" })
  })
})
