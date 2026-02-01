import { BucketName, SPECIES_DATA_KEY, speciesDataJsonSchema } from "@wortle/shared"

import { ISpeciesRepository } from "@/db/SpeciesRepository"
import { dbSpeciesToSpeciesData } from "@/db/toSpecies"
import { serverLogger } from "@/utils/logger"
import { IBucketStorage, MediaType } from "@/utils/R2BucketStorage"

import { protectedProcedure, router } from "./init"

interface PublishRouterDeps {
  speciesRepository: ISpeciesRepository
  bucketStorage: IBucketStorage
  dataBucketName: BucketName
}

export const createPublishRouter = ({ speciesRepository, bucketStorage, dataBucketName }: PublishRouterDeps) =>
  router({
    all: protectedProcedure.mutation(async () => {
      const speciesList = await speciesRepository.list()
      const speciesData = dbSpeciesToSpeciesData(speciesList)

      const validated = speciesDataJsonSchema.parse(speciesData)

      await bucketStorage.upload({
        bucket: dataBucketName,
        key: SPECIES_DATA_KEY,
        body: JSON.stringify(validated),
        contentType: MediaType.APPLICATION_JSON,
      })

      serverLogger.info("publish.all", `Published all data`, {
        speciesCount: validated.species.length,
        bucket: dataBucketName,
      })

      return { success: true, speciesCount: validated.species.length }
    }),
  })
