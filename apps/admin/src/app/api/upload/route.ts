import { originalsBucketName } from "@/utils/bucketNames"
import { bucketStorage } from "@/utils/bucketStorage"

import { createUploadHandler } from "./uploadHandler"

export const POST = createUploadHandler(bucketStorage, originalsBucketName)
