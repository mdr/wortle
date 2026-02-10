import { originalsBucketName } from "@/utils/bucketNames"
import { bucketStorage } from "@/utils/bucketStorage"
import { realClock } from "@/utils/clock"
import { env } from "@/env"

import { createCleanUpStagingHandler } from "./cleanUpStagingHandler"

export const GET = createCleanUpStagingHandler(bucketStorage, originalsBucketName, realClock, env.CRON_SECRET)
