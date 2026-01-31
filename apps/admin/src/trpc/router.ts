import { speciesRepository } from "@/db"
import { r2Client } from "@/utils/R2Client"

import { router } from "./init"
import { createPublishRouter } from "./publishRouter"
import { createSpeciesRouter } from "./speciesRouter"

export const appRouter = router({
  species: createSpeciesRouter(speciesRepository),
  publish: createPublishRouter({ speciesRepository, r2Client }),
})

export type AppRouter = typeof appRouter
