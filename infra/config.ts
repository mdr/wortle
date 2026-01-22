import * as cloudflare from "@pulumi/cloudflare"
import * as pulumi from "@pulumi/pulumi"

const config = new pulumi.Config()

export const accountId = config.require("cloudflareAccountId")
export const dkimValue = config.require("dkimValue")
export const forwardingEmail = config.require("forwardingEmail")

export const zone = await cloudflare.getZone({ filter: { name: "wortle.app" } })
