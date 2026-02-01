import { SPECIES_DATA_BUCKET } from "@wortle/shared"

import { puzzleRepository, speciesRepository } from "@/db"
import { env } from "@/env"
import { bucketStorage } from "@/utils/bucketStorage"

import { router } from "./init"
import { createPublishRouter } from "./publishRouter"
import { createPuzzleRouter } from "./puzzleRouter"
import { createSpeciesRouter } from "./speciesRouter"

const dataBucketName = env.DATA_BUCKET_NAME ?? SPECIES_DATA_BUCKET

export const appRouter = router({
  species: createSpeciesRouter(speciesRepository),
  puzzles: createPuzzleRouter({ puzzleRepository, speciesRepository }),
  publish: createPublishRouter({ speciesRepository, bucketStorage, dataBucketName }),
})

export type AppRouter = typeof appRouter
