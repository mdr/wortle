import { bucketNameSchema, cloudflareAccountIdSchema, cloudflareApiTokenSchema } from "@wortle/shared"
import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    CLOUDFLARE_ACCOUNT_ID: cloudflareAccountIdSchema.optional(),
    CLOUDFLARE_API_TOKEN: cloudflareApiTokenSchema.optional(),
    DATA_BUCKET_NAME: bucketNameSchema.optional(),
  },
  experimental__runtimeEnv: process.env,
})
