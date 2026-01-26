import * as neon from "@pulumi/neon"
import * as vercel from "@pulumiverse/vercel"

import { adminProject } from "./vercel.ts"

const devProject = new neon.Project("wortle-db-dev", {
  name: "wortle-dev",
  pgVersion: 17,
  regionId: "aws-eu-west-2",
  historyRetentionSeconds: 21600,
})

const prodProject = new neon.Project("wortle-db-prod", {
  name: "wortle-prod",
  pgVersion: 17,
  regionId: "aws-eu-west-2",
  historyRetentionSeconds: 21600,
})

export const devDatabaseUrl = devProject.connectionUri
export const prodDatabaseUrl = prodProject.connectionUri

new vercel.ProjectEnvironmentVariable("admin-database-url", {
  projectId: adminProject.id,
  key: "DATABASE_URL",
  value: prodDatabaseUrl,
  targets: ["production", "preview"],
})
