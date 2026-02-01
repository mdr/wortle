import * as cloudflare from "@pulumi/cloudflare"

import { accountId, zone } from "./config.ts"

// R2 bucket for public images (optimized, served via custom domain)
const imagesBucket = new cloudflare.R2Bucket("images", {
  accountId,
  name: "wortle-images",
})

// Public access via images.wortle.app
new cloudflare.R2CustomDomain("images-domain", {
  accountId,
  bucketName: imagesBucket.name,
  domain: "images.wortle.app",
  zoneId: zone.zoneId,
  enabled: true,
})

// R2 bucket for private originals (S3 API access only)
new cloudflare.R2Bucket("originals", {
  accountId,
  name: "wortle-originals",
})

// R2 bucket for public data (schedule, puzzles JSON) - production
const dataBucket = new cloudflare.R2Bucket("data", {
  accountId,
  name: "wortle-data",
})

// Public access via data.wortle.app
new cloudflare.R2CustomDomain("data-domain", {
  accountId,
  bucketName: dataBucket.name,
  domain: "data.wortle.app",
  zoneId: zone.zoneId,
  enabled: true,
})

// R2 bucket for public data - dev/preview
const dataDevBucket = new cloudflare.R2Bucket("data-dev", {
  accountId,
  name: "wortle-data-dev",
})

// Public access via data-dev.wortle.app
new cloudflare.R2CustomDomain("data-dev-domain", {
  accountId,
  bucketName: dataDevBucket.name,
  domain: "data-dev.wortle.app",
  zoneId: zone.zoneId,
  enabled: true,
})

// CORS and cache headers for data.wortle.app and data-dev.wortle.app
new cloudflare.Ruleset("data-cors", {
  zoneId: zone.zoneId,
  name: "Add CORS headers for data subdomain",
  kind: "zone",
  phase: "http_response_headers_transform",
  rules: [
    {
      action: "rewrite",
      actionParameters: {
        headers: {
          "Access-Control-Allow-Origin": {
            operation: "set",
            value: "*",
          },
          "Cache-Control": {
            operation: "set",
            value: "no-store",
          },
        },
      },
      expression: '(http.host eq "data.wortle.app") or (http.host eq "data-dev.wortle.app")',
      enabled: true,
    },
  ],
})
