import { BucketName, CloudflareAccountId, CloudflareApiToken, getOnlyElement, ObjectKey } from "@wortle/shared"
import { withMockServer } from "@wortle/shared/src/withMockServer.testUtils"
import * as mockttp from "mockttp"
import { describe, expect, it } from "vitest"

import { MediaType, R2BucketStorage } from "./R2BucketStorage"

const TEST_ACCOUNT_ID = CloudflareAccountId("test-account-id")
const TEST_API_TOKEN = CloudflareApiToken("test-api-token")
const TEST_BUCKET = BucketName("my-bucket")
const TEST_JSON_KEY = ObjectKey("my-key.json")
const JPEG_HEADER = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]).buffer

const HTTP_OK = 200
const HTTP_FORBIDDEN = 403
const HTTP_NOT_FOUND = 404
const HTTP_INTERNAL_SERVER_ERROR = 500

const withBucketStorage = async (
  callback: (storage: R2BucketStorage, server: mockttp.Mockttp) => Promise<void>,
): Promise<void> =>
  withMockServer(async (server, baseUrl) => {
    const storage = new R2BucketStorage({
      accountId: TEST_ACCOUNT_ID,
      apiToken: TEST_API_TOKEN,
      baseUrl,
    })
    await callback(storage, server)
  })

const objectPath = (key: string) => `/accounts/${TEST_ACCOUNT_ID}/r2/buckets/${TEST_BUCKET}/objects/${key}`

describe("R2BucketStorage", () => {
  describe("uploadJson", () => {
    it("stringifies body and sets content type to application/json", () =>
      withBucketStorage(async (storage, server) => {
        const endpoint = await server.forPut(objectPath(TEST_JSON_KEY)).thenReply(HTTP_OK, "")

        await storage.uploadJson({
          bucket: TEST_BUCKET,
          key: TEST_JSON_KEY,
          body: { data: "test" },
        })

        const request = getOnlyElement(await endpoint.getSeenRequests())
        expect(request.headers.authorization).toBe(`Bearer ${TEST_API_TOKEN}`)
        expect(request.headers["content-type"]).toBe(MediaType.APPLICATION_JSON)
        expect(await request.body.getText()).toBe('{"data":"test"}')
      }))

    it("throws on HTTP error", () =>
      withBucketStorage(async (storage, server) => {
        await server.forPut(objectPath(TEST_JSON_KEY)).thenReply(HTTP_FORBIDDEN, "Forbidden")

        await expect(
          storage.uploadJson({
            bucket: TEST_BUCKET,
            key: TEST_JSON_KEY,
            body: { data: "test" },
          }),
        ).rejects.toThrow("R2 upload failed: 403 Forbidden")
      }))
  })

  describe("uploadBinary", () => {
    it("uploads binary data with specified content type", () =>
      withBucketStorage(async (storage, server) => {
        const endpoint = await server.forPut(objectPath("photo.jpg")).thenReply(HTTP_OK, "")

        await storage.uploadBinary({
          bucket: TEST_BUCKET,
          key: ObjectKey("photo.jpg"),
          body: JPEG_HEADER,
          contentType: MediaType.IMAGE_JPEG,
        })

        const request = getOnlyElement(await endpoint.getSeenRequests())
        expect(request.headers.authorization).toBe(`Bearer ${TEST_API_TOKEN}`)
        expect(request.headers["content-type"]).toBe(MediaType.IMAGE_JPEG)
      }))

    it("throws on HTTP error", () =>
      withBucketStorage(async (storage, server) => {
        await server.forPut(objectPath("photo.jpg")).thenReply(HTTP_INTERNAL_SERVER_ERROR, "Internal Server Error")

        await expect(
          storage.uploadBinary({
            bucket: TEST_BUCKET,
            key: ObjectKey("photo.jpg"),
            body: new ArrayBuffer(0),
            contentType: MediaType.IMAGE_JPEG,
          }),
        ).rejects.toThrow("R2 upload failed: 500 Internal Server Error")
      }))
  })

  describe("deleteObject", () => {
    it("sends DELETE request with auth header", () =>
      withBucketStorage(async (storage, server) => {
        const endpoint = await server.forDelete(objectPath("old-file.jpg")).thenReply(HTTP_OK, "")

        await storage.deleteObject(TEST_BUCKET, ObjectKey("old-file.jpg"))

        const request = getOnlyElement(await endpoint.getSeenRequests())
        expect(request.headers.authorization).toBe(`Bearer ${TEST_API_TOKEN}`)
      }))

    it("throws on HTTP error", () =>
      withBucketStorage(async (storage, server) => {
        await server.forDelete(objectPath("old-file.jpg")).thenReply(HTTP_NOT_FOUND, "Not Found")

        await expect(storage.deleteObject(TEST_BUCKET, ObjectKey("old-file.jpg"))).rejects.toThrow(
          "R2 delete failed: 404 Not Found",
        )
      }))
  })

  describe("listObjects", () => {
    it("lists objects with prefix and parses response", () =>
      withBucketStorage(async (storage, server) => {
        await server
          .forGet(`/accounts/${TEST_ACCOUNT_ID}/r2/buckets/${TEST_BUCKET}/objects`)
          .withQuery({ prefix: "staging/" })
          .thenJson(HTTP_OK, {
            result: [
              { key: "staging/abc.jpg", uploaded: "2025-01-15T10:00:00Z" },
              { key: "staging/def.jpg", uploaded: "2025-01-15T11:00:00Z" },
            ],
          })

        const objects = await storage.listObjects(TEST_BUCKET, "staging/")

        expect(objects).toEqual([
          { key: ObjectKey("staging/abc.jpg"), uploaded: new Date("2025-01-15T10:00:00Z") },
          { key: ObjectKey("staging/def.jpg"), uploaded: new Date("2025-01-15T11:00:00Z") },
        ])
      }))

    it("throws on HTTP error", () =>
      withBucketStorage(async (storage, server) => {
        await server
          .forGet(`/accounts/${TEST_ACCOUNT_ID}/r2/buckets/${TEST_BUCKET}/objects`)
          .withQuery({ prefix: "staging/" })
          .thenReply(HTTP_FORBIDDEN, "Forbidden")

        await expect(storage.listObjects(TEST_BUCKET, "staging/")).rejects.toThrow("R2 list failed: 403 Forbidden")
      }))
  })

  describe("getObject", () => {
    it("returns response body as ArrayBuffer", () =>
      withBucketStorage(async (storage, server) => {
        await server.forGet(objectPath("photo.jpg")).thenReply(HTTP_OK, Buffer.from(JPEG_HEADER))

        const result = await storage.getObject(TEST_BUCKET, ObjectKey("photo.jpg"))

        expect(new Uint8Array(result)).toEqual(new Uint8Array(JPEG_HEADER))
      }))

    it("throws on HTTP error", () =>
      withBucketStorage(async (storage, server) => {
        await server.forGet(objectPath("photo.jpg")).thenReply(HTTP_NOT_FOUND, "Not Found")

        await expect(storage.getObject(TEST_BUCKET, ObjectKey("photo.jpg"))).rejects.toThrow(
          "R2 get failed: 404 Not Found",
        )
      }))
  })
})
