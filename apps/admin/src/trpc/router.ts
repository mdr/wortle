import { puzzleRepository, scheduleRepository, taxaRepository } from "@/db"
import { dataBucketName, imagesBucketName, originalsBucketName } from "@/utils/bucketNames"
import { bucketStorage } from "@/utils/bucketStorage"

import { router } from "./init"
import { createPublishRouter } from "./publishRouter"
import { createPuzzleRouter } from "./puzzleRouter"
import { createScheduleRouter } from "./scheduleRouter"
import { createTaxaRouter } from "./taxaRouter"

export const appRouter = router({
  taxa: createTaxaRouter(taxaRepository, puzzleRepository),
  puzzles: createPuzzleRouter({ puzzleRepository, taxaRepository, bucketStorage, originalsBucketName }),
  schedule: createScheduleRouter({ scheduleRepository, puzzleRepository }),
  publish: createPublishRouter({
    taxaRepository,
    puzzleRepository,
    scheduleRepository,
    bucketStorage,
    dataBucketName,
    originalsBucketName,
    imagesBucketName,
  }),
})

export type AppRouter = typeof appRouter
