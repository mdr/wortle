import { env } from "@/env"

import { IBucketStorage, R2BucketStorage } from "./R2BucketStorage"

const accountId = env.CLOUDFLARE_ACCOUNT_ID
const apiToken = env.CLOUDFLARE_API_TOKEN

if (accountId === undefined || apiToken === undefined) {
  throw new Error("CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN must be set")
}

export const bucketStorage: IBucketStorage = new R2BucketStorage({ accountId, apiToken })
