import { env } from "@/env"

import { serverLogger } from "./logger"

export const dataBucketName = env.DATA_BUCKET_NAME
export const originalsBucketName = env.ORIGINALS_BUCKET_NAME
export const imagesBucketName = env.IMAGES_BUCKET_NAME

const databaseUrl = new URL(env.DATABASE_URL)
serverLogger.info("config", "Configuration", {
  databaseHost: databaseUrl.host,
  dataBucket: dataBucketName,
  originalsBucket: originalsBucketName,
  imagesBucket: imagesBucketName,
})
