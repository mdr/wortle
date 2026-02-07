import { ImageMediaType, ORIGINALS_BUCKET, STAGING_PREFIX } from "@wortle/shared"
import { describe, expect, it } from "vitest"

import { FakeBucketStorage } from "@/utils/FakeBucketStorage.testUtils"
import { HttpStatus } from "@/utils/httpStatus"
import { MediaType } from "@/utils/R2BucketStorage"
import { FIXED_TIME, fixedClock, JPEG_HEADER } from "@/utils/testConstants.testUtils"

import { uploadResponseSchema } from "@/api/uploadTypes"

import { createUploadHandler } from "./uploadHandler"

const uploadRequest = (file: File) => {
  const formData = new FormData()
  formData.append("file", file)
  return new Request("http://localhost/api/upload", { method: "POST", body: formData })
}

describe("upload route", () => {
  it("uploads JPEG to staging and returns staging key", async () => {
    const storage = new FakeBucketStorage(fixedClock)
    const handler = createUploadHandler(storage)

    const response = await handler(uploadRequest(new File([JPEG_HEADER], "photo.jpg", { type: MediaType.IMAGE_JPEG })))

    expect(response.status).toBe(HttpStatus.OK)
    const { stagingKey, mediaType } = uploadResponseSchema.parse(await response.json())
    expect(stagingKey).toMatch(new RegExp(`^${STAGING_PREFIX}.+\\.jpg$`))
    expect(mediaType).toBe(ImageMediaType.JPEG)
    expect(storage.objects.size).toBe(1)
    const stored = storage.getStoredObject(ORIGINALS_BUCKET, stagingKey)
    expect(new Uint8Array(stored.body as ArrayBuffer)).toEqual(new Uint8Array(JPEG_HEADER))
    expect(stored.contentType).toBe(MediaType.IMAGE_JPEG)
    expect(stored.uploaded).toEqual(FIXED_TIME)
  })

  it("uploads HEIC to staging", async () => {
    const storage = new FakeBucketStorage()
    const handler = createUploadHandler(storage)

    const response = await handler(uploadRequest(new File([JPEG_HEADER], "photo.heic", { type: MediaType.IMAGE_HEIC })))

    expect(response.status).toBe(HttpStatus.OK)
    const { stagingKey, mediaType } = uploadResponseSchema.parse(await response.json())
    expect(stagingKey).toMatch(new RegExp(`^${STAGING_PREFIX}.+\\.heic$`))
    expect(mediaType).toBe(ImageMediaType.HEIC)
    expect(storage.objects.size).toBe(1)
  })

  it("rejects unsupported file types", async () => {
    const storage = new FakeBucketStorage()
    const handler = createUploadHandler(storage)

    const response = await handler(uploadRequest(new File(["data"], "doc.pdf", { type: "application/pdf" })))

    expect(response.status).toBe(HttpStatus.BAD_REQUEST)
    expect(await response.json()).toEqual({
      error: "Unsupported file type: application/pdf. Accepted: image/jpeg, image/heic",
    })
    expect(storage.objects.size).toBe(0)
  })

  it("rejects request with no file", async () => {
    const storage = new FakeBucketStorage()
    const handler = createUploadHandler(storage)

    const formData = new FormData()
    const response = await handler(new Request("http://localhost/api/upload", { method: "POST", body: formData }))

    expect(response.status).toBe(HttpStatus.BAD_REQUEST)
    expect(await response.json()).toEqual({ error: "No file provided" })
  })
})
