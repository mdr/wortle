import * as cloudflare from "@pulumi/cloudflare"

import { accountId, dkimValue, forwardingEmail, zone } from "./config.ts"

// MX records for Cloudflare Email Routing
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

// SPF record
new cloudflare.DnsRecord("email-spf", {
  zoneId: zone.zoneId,
  name: "@",
  type: "TXT",
  content: "v=spf1 include:_spf.mx.cloudflare.net ~all",
  ttl: 1,
})

// DKIM record
new cloudflare.DnsRecord("email-dkim", {
  zoneId: zone.zoneId,
  name: "cf2024-1._domainkey",
  type: "TXT",
  content: dkimValue,
  ttl: 1,
})

// Email routing - forward all @wortle.app to personal email
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
