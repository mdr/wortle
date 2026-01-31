import { speciesRepository } from "@/db"
import { bucketStorage } from "@/utils/R2BucketStorage"

import { router } from "./init"
import { createPublishRouter } from "./publishRouter"
import { createSpeciesRouter } from "./speciesRouter"

export const appRouter = router({
  species: createSpeciesRouter(speciesRepository),
  publish: createPublishRouter({ speciesRepository, bucketStorage }),
})

export type AppRouter = typeof appRouter
