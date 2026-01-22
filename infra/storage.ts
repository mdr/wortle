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

// R2 bucket for public data (schedule, puzzles JSON)
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

// CORS headers for data.wortle.app (required for cross-origin fetch from wortle.app)
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
        },
      },
      expression: '(http.host eq "data.wortle.app")',
      enabled: true,
    },
  ],
})
