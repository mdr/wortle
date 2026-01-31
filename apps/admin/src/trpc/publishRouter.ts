import { BucketName, speciesDataJsonSchema, SPECIES_DATA_KEY } from "@wortle/shared"

import { ISpeciesRepository } from "@/db/SpeciesRepository"
import { toSpeciesData } from "@/db/toSpecies"
import { logger } from "@/utils/logger"
import { IR2Client, MediaType } from "@/utils/R2Client"

import { protectedProcedure, router } from "./init"

interface PublishRouterDeps {
  speciesRepository: ISpeciesRepository
  r2Client: IR2Client
}

export const createPublishRouter = ({ speciesRepository, r2Client }: PublishRouterDeps) =>
  router({
    all: protectedProcedure.mutation(async () => {
      const speciesList = await speciesRepository.list()
      const speciesData = toSpeciesData(speciesList)

      const validated = speciesDataJsonSchema.parse(speciesData)

      await r2Client.upload({
        bucket: BucketName("wortle-data"),
        key: SPECIES_DATA_KEY,
        body: JSON.stringify(validated),
        contentType: MediaType.APPLICATION_JSON,
      })

      logger.info("publish.all", `Published all data`, { speciesCount: validated.species.length })

      return { success: true, speciesCount: validated.species.length }
    }),
  })
