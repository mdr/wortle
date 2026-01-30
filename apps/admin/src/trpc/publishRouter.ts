import { BucketName, ObjectKey, speciesJsonSchema } from "@wortle/shared"

import { speciesRepository } from "@/db"
import { toSpeciesData } from "@/db/toSpecies"
import { logger } from "@/utils/logger"
import { MediaType, r2Client } from "@/utils/R2Client"

import { protectedProcedure, router } from "./init"

export const publishRouter = router({
  species: protectedProcedure.mutation(async () => {
    const speciesList = await speciesRepository.list()
    const speciesData = toSpeciesData(speciesList)

    const validated = speciesJsonSchema.parse(speciesData)

    await r2Client.upload({
      bucket: BucketName("wortle-data"),
      key: ObjectKey("species.json"),
      body: JSON.stringify(validated),
      contentType: MediaType.APPLICATION_JSON,
    })

    logger.info("publish.species", `Published ${validated.species.length} species`, {
      speciesCount: validated.species.length,
    })

    return { success: true, speciesCount: validated.species.length }
  }),
})
