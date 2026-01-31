import { BucketName, speciesDataJsonSchema, SPECIES_DATA_KEY, TestSpeciesIds } from "@wortle/shared"
import { describe, expect, it } from "vitest"

import { FakeSpeciesRepository } from "@/db/FakeSpeciesRepository.testUtils"
import { FakeR2Client } from "@/utils/FakeR2Client.testUtils"
import { MediaType } from "@/utils/R2Client"

import { router } from "./init"
import { createPublishRouter } from "./publishRouter"
import { makeDbSpecies, testContext } from "./testFactories.testUtils"

const createTestCaller = (speciesRepository: FakeSpeciesRepository, r2Client: FakeR2Client) => {
  const publishRouter = createPublishRouter({ speciesRepository, r2Client })
  const testRouter = router({ publish: publishRouter })
  return testRouter.createCaller(testContext)
}

describe("publishRouter", () => {
  describe("all", () => {
    it("publishes species data to R2", async () => {
      const repo = new FakeSpeciesRepository()
      await repo.create(makeDbSpecies({ id: TestSpeciesIds.daisy }))
      await repo.create(makeDbSpecies({ id: TestSpeciesIds.tansy }))
      const r2Client = new FakeR2Client()
      const caller = createTestCaller(repo, r2Client)

      const result = await caller.publish.all()

      expect(result).toEqual({ success: true, speciesCount: 2 })
      expect(r2Client.uploads).toHaveLength(1)
      expect(r2Client.uploads[0]).toMatchObject({
        bucket: BucketName("wortle-data"),
        key: SPECIES_DATA_KEY,
        contentType: MediaType.APPLICATION_JSON,
      })
      const uploadedBody = speciesDataJsonSchema.parse(JSON.parse(r2Client.uploads[0].body))
      expect(uploadedBody.species.map((s) => s.id)).toIncludeSameMembers([TestSpeciesIds.daisy, TestSpeciesIds.tansy])
    })

    it("publishes empty species array when no species exist", async () => {
      const repo = new FakeSpeciesRepository()
      const r2Client = new FakeR2Client()
      const caller = createTestCaller(repo, r2Client)

      const result = await caller.publish.all()

      expect(result).toEqual({ success: true, speciesCount: 0 })
      const uploadedBody = speciesDataJsonSchema.parse(JSON.parse(r2Client.uploads[0].body))
      expect(uploadedBody.species).toEqual([])
    })
  })
})
