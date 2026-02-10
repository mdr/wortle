import { puzzleRepository, scheduleRepository, speciesRepository } from "@/db"
import { dataBucketName, imagesBucketName, originalsBucketName } from "@/utils/bucketNames"
import { bucketStorage } from "@/utils/bucketStorage"

import { router } from "./init"
import { createPublishRouter } from "./publishRouter"
import { createPuzzleRouter } from "./puzzleRouter"
import { createScheduleRouter } from "./scheduleRouter"
import { createSpeciesRouter } from "./speciesRouter"

export const appRouter = router({
  species: createSpeciesRouter(speciesRepository, puzzleRepository),
  puzzles: createPuzzleRouter({ puzzleRepository, speciesRepository, bucketStorage, originalsBucketName }),
  schedule: createScheduleRouter({ scheduleRepository, puzzleRepository }),
  publish: createPublishRouter({
    speciesRepository,
    puzzleRepository,
    scheduleRepository,
    bucketStorage,
    dataBucketName,
    originalsBucketName,
    imagesBucketName,
  }),
})

export type AppRouter = typeof appRouter
