import { BucketName, CloudflareAccountId, CloudflareApiToken, MediaType } from "@wortle/shared"

import { R2BucketStorage } from "../src/utils/R2BucketStorage"

const requireEnv = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    console.error(`${name} environment variable is required`)
    process.exit(1)
  }
  return value
}

const main = async () => {
  const accountId = CloudflareAccountId(requireEnv("CLOUDFLARE_ACCOUNT_ID"))
  const apiToken = CloudflareApiToken(requireEnv("CLOUDFLARE_API_TOKEN"))
  const srcBucket = BucketName(requireEnv("SRC_BUCKET"))
  const destBucket = BucketName(requireEnv("DEST_BUCKET"))

  const storage = new R2BucketStorage({ accountId, apiToken })

  console.log(`Listing objects in ${srcBucket}...`)
  const objects = await storage.listObjects(srcBucket, "")
  console.log(`Found ${objects.length} objects to copy`)

  let copied = 0
  for (const obj of objects) {
    const data = await storage.getObject(srcBucket, obj.key)
    await storage.uploadBinary({
      bucket: destBucket,
      key: obj.key,
      body: data,
      contentType: MediaType("application/octet-stream"),
    })
    copied++
    console.log(`[${copied}/${objects.length}] Copied ${obj.key}`)
  }

  console.log(`Done — copied ${copied} objects from ${srcBucket} to ${destBucket}`)
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
