import { SPECIES_DATA_BUCKET, SPECIES_DATA_KEY, speciesDataJsonSchema } from "@wortle/shared"

import { ISpeciesRepository } from "@/db/SpeciesRepository"
import { toSpeciesData } from "@/db/toSpecies"
import { logger } from "@/utils/logger"
import { IBucketStorage, MediaType } from "@/utils/R2BucketStorage"

import { protectedProcedure, router } from "./init"

interface PublishRouterDeps {
  speciesRepository: ISpeciesRepository
  bucketStorage: IBucketStorage
}

export const createPublishRouter = ({ speciesRepository, bucketStorage }: PublishRouterDeps) =>
  router({
    all: protectedProcedure.mutation(async () => {
      const speciesList = await speciesRepository.list()
      const speciesData = toSpeciesData(speciesList)

      const validated = speciesDataJsonSchema.parse(speciesData)

      await bucketStorage.upload({
        bucket: SPECIES_DATA_BUCKET,
        key: SPECIES_DATA_KEY,
        body: JSON.stringify(validated),
        contentType: MediaType.APPLICATION_JSON,
      })

      logger.info("publish.all", `Published all data`, { speciesCount: validated.species.length })

      return { success: true, speciesCount: validated.species.length }
    }),
  })
