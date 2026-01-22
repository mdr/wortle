import * as cloudflare from "@pulumi/cloudflare"
import * as pulumi from "@pulumi/pulumi"

const config = new pulumi.Config()
const accountId = config.require("cloudflareAccountId")

const zone = await cloudflare.getZone({ filter: { name: "wortle.app" } })

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

// GitHub Pages A records for apex domain
// https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain
const ghPagesIps = ["185.199.108.153", "185.199.109.153", "185.199.110.153", "185.199.111.153"]

ghPagesIps.forEach((ip, i) => {
  new cloudflare.DnsRecord(`gh-pages-a-${i}`, {
    zoneId: zone.zoneId,
    name: "@",
    type: "A",
    content: ip,
    ttl: 300,
    proxied: false,
  })
})

// www subdomain CNAME for GitHub Pages
new cloudflare.DnsRecord("gh-pages-www", {
  zoneId: zone.zoneId,
  name: "www",
  type: "CNAME",
  content: "mdr.github.io",
  ttl: 300,
  proxied: false,
})

// Email routing DNS records
const mxRecords = [
  { priority: 5, value: "route2.mx.cloudflare.net" },
  { priority: 8, value: "route1.mx.cloudflare.net" },
  { priority: 14, value: "route3.mx.cloudflare.net" },
]

mxRecords.forEach(({ priority, value }, i) => {
  new cloudflare.DnsRecord(`email-mx-${i}`, {
    zoneId: zone.zoneId,
    name: "@",
    type: "MX",
    content: value,
    priority,
    ttl: 1,
  })
})

new cloudflare.DnsRecord("email-spf", {
  zoneId: zone.zoneId,
  name: "@",
  type: "TXT",
  content: "v=spf1 include:_spf.mx.cloudflare.net ~all",
  ttl: 1,
})

const dkimValue = config.require("dkimValue")

new cloudflare.DnsRecord("email-dkim", {
  zoneId: zone.zoneId,
  name: "cf2024-1._domainkey",
  type: "TXT",
  content: dkimValue,
  ttl: 1,
})

// Email routing - forward all @wortle.app to personal email
const forwardingEmail = config.require("forwardingEmail")

new cloudflare.EmailRoutingAddress("forwarding-destination", {
  accountId,
  email: forwardingEmail,
})

new cloudflare.EmailRoutingCatchAll("catch-all", {
  zoneId: zone.zoneId,
  name: "catch-all",
  enabled: true,
  matchers: [{ type: "all" }],
  actions: [
    {
      type: "forward",
      values: [forwardingEmail],
    },
  ],
})
