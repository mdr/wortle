import { originalsBucketName } from "@/utils/bucketNames"
import { bucketStorage } from "@/utils/bucketStorage"

import { createOriginalsHandler } from "./originalsHandler"

export const dynamic = "force-dynamic"

export const GET = createOriginalsHandler(bucketStorage, originalsBucketName)
