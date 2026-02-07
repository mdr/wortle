import { puzzleRepository, speciesRepository } from "@/db"
import { dataBucketName, imagesBucketName, originalsBucketName } from "@/utils/bucketNames"
import { bucketStorage } from "@/utils/bucketStorage"

import { router } from "./init"
import { createPublishRouter } from "./publishRouter"
import { createPuzzleRouter } from "./puzzleRouter"
import { createSpeciesRouter } from "./speciesRouter"

export const appRouter = router({
  species: createSpeciesRouter(speciesRepository, puzzleRepository),
  puzzles: createPuzzleRouter({ puzzleRepository, speciesRepository, bucketStorage, originalsBucketName }),
  publish: createPublishRouter({
    speciesRepository,
    puzzleRepository,
    bucketStorage,
    dataBucketName,
    originalsBucketName,
    imagesBucketName,
  }),
})

export type AppRouter = typeof appRouter
