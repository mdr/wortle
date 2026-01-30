import { BucketName, ObjectKey } from "@wortle/shared"
import { withMockServer } from "@wortle/shared/withMockServer.testUtils"
import * as mockttp from "mockttp"
import { describe, expect, it } from "vitest"

import { MediaType, R2Client } from "./R2Client"

const TEST_ACCOUNT_ID = "test-account-id"
const TEST_API_TOKEN = "test-api-token"

const withR2Client = async (callback: (client: R2Client, server: mockttp.Mockttp) => Promise<void>): Promise<void> =>
  withMockServer(async (server, baseUrl) => {
    const client = new R2Client({
      accountId: TEST_ACCOUNT_ID,
      apiToken: TEST_API_TOKEN,
      baseUrl,
    })
    await callback(client, server)
  })

describe("R2Client", () => {
  describe("upload", () => {
    it("uploads to correct URL with auth header and body", () =>
      withR2Client(async (client, server) => {
        const endpoint = await server
          .forPut(`/accounts/${TEST_ACCOUNT_ID}/r2/buckets/my-bucket/objects/my-key.json`)
          .thenReply(200, "")

        const body = '{"data": "test"}'
        await client.upload({
          bucket: BucketName("my-bucket"),
          key: ObjectKey("my-key.json"),
          body,
          contentType: MediaType.APPLICATION_JSON,
        })

        const requests = await endpoint.getSeenRequests()
        expect(requests).toHaveLength(1)
        expect(requests[0].headers.authorization).toBe(`Bearer ${TEST_API_TOKEN}`)
        expect(requests[0].headers["content-type"]).toBe("application/json")
        expect(await requests[0].body.getText()).toBe(body)
      }))

    it("throws on HTTP error", () =>
      withR2Client(async (client, server) => {
        await server
          .forPut(`/accounts/${TEST_ACCOUNT_ID}/r2/buckets/my-bucket/objects/my-key.json`)
          .thenReply(403, "Forbidden")

        await expect(
          client.upload({
            bucket: BucketName("my-bucket"),
            key: ObjectKey("my-key.json"),
            body: "test",
            contentType: MediaType.TEXT_PLAIN,
          }),
        ).rejects.toThrow("R2 upload failed: 403 Forbidden")
      }))
  })
})
