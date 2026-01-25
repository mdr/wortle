import * as cloudflare from "@pulumi/cloudflare"

import { zone } from "./config.ts"

// Vercel A record for apex domain
new cloudflare.DnsRecord("vercel-apex", {
  zoneId: zone.zoneId,
  name: "@",
  type: "A",
  content: "216.198.79.1",
  ttl: 300,
  proxied: false,
})

// www subdomain CNAME for Vercel
new cloudflare.DnsRecord("vercel-www", {
  zoneId: zone.zoneId,
  name: "www",
  type: "CNAME",
  content: "8c25fa0b5c7ec183.vercel-dns-017.com",
  ttl: 300,
  proxied: false,
})
