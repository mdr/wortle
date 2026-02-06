import {
  ScientificName,
  SPECIES_DATA_BUCKET,
  SPECIES_DATA_KEY,
  speciesDataJsonSchema,
  TestSpeciesIds,
} from "@wortle/shared"
import { describe, expect, it } from "vitest"

import { FakeSpeciesRepository } from "@/db/FakeSpeciesRepository.testUtils"
import { FakeBucketStorage } from "@/utils/FakeBucketStorage.testUtils"

import { router } from "./init"
import { createPublishRouter } from "./publishRouter"
import { makeDbSpecies, testContext } from "./testFactories.testUtils"

const createTestCaller = (speciesRepository: FakeSpeciesRepository, bucketStorage: FakeBucketStorage) => {
  const publishRouter = createPublishRouter({ speciesRepository, bucketStorage, dataBucketName: SPECIES_DATA_BUCKET })
  const testRouter = router({ publish: publishRouter })
  return testRouter.createCaller(testContext)
}

describe("publishRouter", () => {
  describe("all", () => {
    it("publishes species data to R2 sorted by scientific name", async () => {
      const repo = new FakeSpeciesRepository()
      await repo.create(
        makeDbSpecies({ id: TestSpeciesIds.tansy, scientificName: ScientificName("Tanacetum vulgare") }),
      )
      await repo.create(makeDbSpecies({ id: TestSpeciesIds.daisy, scientificName: ScientificName("Bellis perennis") }))
      await repo.create(
        makeDbSpecies({ id: TestSpeciesIds.herbRobert, scientificName: ScientificName("Geranium robertianum") }),
      )
      const bucketStorage = new FakeBucketStorage()
      const caller = createTestCaller(repo, bucketStorage)

      const result = await caller.publish.all()

      expect(result).toEqual({ success: true, speciesCount: 3 })
      const uploadedBody = speciesDataJsonSchema.parse(bucketStorage.getJson(SPECIES_DATA_BUCKET, SPECIES_DATA_KEY))
      expect(uploadedBody.species.map((s) => s.id)).toEqual([
        TestSpeciesIds.daisy,
        TestSpeciesIds.herbRobert,
        TestSpeciesIds.tansy,
      ])
    })

    it("publishes empty species array when no species exist", async () => {
      const repo = new FakeSpeciesRepository()
      const bucketStorage = new FakeBucketStorage()
      const caller = createTestCaller(repo, bucketStorage)

      const result = await caller.publish.all()

      expect(result).toEqual({ success: true, speciesCount: 0 })
      const uploadedBody = speciesDataJsonSchema.parse(bucketStorage.getJson(SPECIES_DATA_BUCKET, SPECIES_DATA_KEY))
      expect(uploadedBody.species).toEqual([])
    })
  })
})
