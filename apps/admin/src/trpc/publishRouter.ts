import { speciesJsonSchema } from "@wortle/shared"

import { speciesRepository } from "@/db"
import { toSpeciesData } from "@/db/toSpecies"
import { logger } from "@/utils/logger"
import { uploadToR2 } from "@/utils/r2"

import { protectedProcedure, router } from "./init"

export const publishRouter = router({
  species: protectedProcedure.mutation(async () => {
    const speciesList = await speciesRepository.list()
    const speciesData = toSpeciesData(speciesList)

    const validated = speciesJsonSchema.parse(speciesData)

    await uploadToR2({
      bucket: "wortle-data",
      key: "species.json",
      body: JSON.stringify(validated),
      contentType: "application/json",
    })

    logger.info("publish.species", `Published ${validated.species.length} species`, {
      speciesCount: validated.species.length,
    })

    return { success: true, speciesCount: validated.species.length }
  }),
})
