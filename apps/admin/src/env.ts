import { cloudflareAccountIdSchema, cloudflareApiTokenSchema } from "@wortle/shared"
import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    CLOUDFLARE_ACCOUNT_ID: cloudflareAccountIdSchema.optional(),
    CLOUDFLARE_API_TOKEN: cloudflareApiTokenSchema.optional(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
  },
})
