import { BucketName, CloudflareAccountId, CloudflareApiToken, getOnlyElement, ObjectKey } from "@wortle/shared"
import { withMockServer } from "@wortle/shared/src/withMockServer.testUtils"
import * as mockttp from "mockttp"
import { describe, expect, it } from "vitest"

import { MediaType, R2BucketStorage } from "./R2BucketStorage"

const TEST_ACCOUNT_ID = CloudflareAccountId("test-account-id")
const TEST_API_TOKEN = CloudflareApiToken("test-api-token")

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

describe("R2BucketStorage", () => {
  describe("upload", () => {
    it("uploads to correct URL with auth header and body", () =>
      withBucketStorage(async (storage, server) => {
        const endpoint = await server
          .forPut(`/accounts/${TEST_ACCOUNT_ID}/r2/buckets/my-bucket/objects/my-key.json`)
          .thenReply(200, "")

        const body = '{"data": "test"}'
        await storage.upload({
          bucket: BucketName("my-bucket"),
          key: ObjectKey("my-key.json"),
          body,
          contentType: MediaType.APPLICATION_JSON,
        })

        const request = getOnlyElement(await endpoint.getSeenRequests())
        expect(request.headers.authorization).toBe(`Bearer ${TEST_API_TOKEN}`)
        expect(request.headers["content-type"]).toBe("application/json")
        expect(await request.body.getText()).toBe(body)
      }))

    it("throws on HTTP error", () =>
      withBucketStorage(async (storage, server) => {
        await server
          .forPut(`/accounts/${TEST_ACCOUNT_ID}/r2/buckets/my-bucket/objects/my-key.json`)
          .thenReply(403, "Forbidden")

        await expect(
          storage.upload({
            bucket: BucketName("my-bucket"),
            key: ObjectKey("my-key.json"),
            body: "test",
            contentType: MediaType.TEXT_PLAIN,
          }),
        ).rejects.toThrow("R2 upload failed: 403 Forbidden")
      }))
  })
})
