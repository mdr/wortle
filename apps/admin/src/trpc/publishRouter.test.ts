import { SPECIES_DATA_BUCKET, SPECIES_DATA_KEY, speciesDataJsonSchema, TestSpeciesIds } from "@wortle/shared"
import { describe, expect, it } from "vitest"

import { FakeSpeciesRepository } from "@/db/FakeSpeciesRepository.testUtils"
import { FakeBucketStorage } from "@/utils/FakeBucketStorage.testUtils"
import { MediaType } from "@/utils/R2BucketStorage"

import { router } from "./init"
import { createPublishRouter } from "./publishRouter"
import { makeDbSpecies, testContext } from "./testFactories.testUtils"

const createTestCaller = (speciesRepository: FakeSpeciesRepository, bucketStorage: FakeBucketStorage) => {
  const publishRouter = createPublishRouter({ speciesRepository, bucketStorage })
  const testRouter = router({ publish: publishRouter })
  return testRouter.createCaller(testContext)
}

describe("publishRouter", () => {
  describe("all", () => {
    it("publishes species data to R2", async () => {
      const repo = new FakeSpeciesRepository()
      await repo.create(makeDbSpecies({ id: TestSpeciesIds.daisy }))
      await repo.create(makeDbSpecies({ id: TestSpeciesIds.tansy }))
      const bucketStorage = new FakeBucketStorage()
      const caller = createTestCaller(repo, bucketStorage)

      const result = await caller.publish.all()

      expect(result).toEqual({ success: true, speciesCount: 2 })
      const storedObject = bucketStorage.get(SPECIES_DATA_BUCKET, SPECIES_DATA_KEY)
      expect(storedObject.contentType).toBe(MediaType.APPLICATION_JSON)
      const uploadedBody = speciesDataJsonSchema.parse(JSON.parse(storedObject.body))
      expect(uploadedBody.species.map((s) => s.id)).toIncludeSameMembers([TestSpeciesIds.daisy, TestSpeciesIds.tansy])
    })

    it("publishes empty species array when no species exist", async () => {
      const repo = new FakeSpeciesRepository()
      const bucketStorage = new FakeBucketStorage()
      const caller = createTestCaller(repo, bucketStorage)

      const result = await caller.publish.all()

      expect(result).toEqual({ success: true, speciesCount: 0 })
      const storedObject = bucketStorage.get(SPECIES_DATA_BUCKET, SPECIES_DATA_KEY)
      const uploadedBody = speciesDataJsonSchema.parse(JSON.parse(storedObject.body))
      expect(uploadedBody.species).toEqual([])
    })
  })
})
