import { SPECIES_DATA_BUCKET } from "@wortle/shared"

import { speciesRepository } from "@/db"
import { env } from "@/env"
import { bucketStorage } from "@/utils/bucketStorage"

import { router } from "./init"
import { createPublishRouter } from "./publishRouter"
import { createSpeciesRouter } from "./speciesRouter"

const dataBucketName = env.DATA_BUCKET_NAME ?? SPECIES_DATA_BUCKET

export const appRouter = router({
  species: createSpeciesRouter(speciesRepository),
  publish: createPublishRouter({ speciesRepository, bucketStorage, dataBucketName }),
})

export type AppRouter = typeof appRouter
