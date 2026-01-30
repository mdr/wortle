import { speciesJsonSchema } from "@wortle/shared"

import { db } from "@/db"
import { species } from "@/db/schema"
import { toSpeciesData } from "@/db/toSpecies"
import { logger } from "@/utils/logger"
import { uploadToR2 } from "@/utils/r2"

import { protectedProcedure, router } from "./init"

export const publishRouter = router({
  species: protectedProcedure.mutation(async () => {
    const rows = await db.select().from(species)
    const speciesData = toSpeciesData(rows.map((row) => row.data))

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
