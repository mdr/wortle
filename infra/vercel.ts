import * as pulumi from "@pulumi/pulumi"
import * as random from "@pulumi/random"
import * as vercel from "@pulumiverse/vercel"

const config = new pulumi.Config()

// Game app project
export const gameProject = new vercel.Project("game", {
  name: "wortle-game",
  framework: "vite",
  gitRepository: {
    type: "github",
    repo: "mdr/wortle",
  },
  rootDirectory: "apps/game",
})

// Production domains
new vercel.ProjectDomain("game-domain-apex", {
  projectId: gameProject.id,
  domain: "wortle.app",
})

new vercel.ProjectDomain("game-domain-www", {
  projectId: gameProject.id,
  domain: "www.wortle.app",
})

// Admin app project
export const adminProject = new vercel.Project("admin", {
  name: "wortle-admin",
  framework: "nextjs",
  gitRepository: {
    type: "github",
    repo: "mdr/wortle",
  },
  rootDirectory: "apps/admin",
})

new vercel.ProjectDomain("admin-domain", {
  projectId: adminProject.id,
  domain: "admin.wortle.app",
})

// Cloudflare credentials for admin app R2 uploads (runtime, not infra provisioning)
const adminR2ApiToken = config.requireSecret("admin-r2-api-token")

new vercel.ProjectEnvironmentVariable("admin-cloudflare-account-id", {
  projectId: adminProject.id,
  key: "CLOUDFLARE_ACCOUNT_ID",
  value: "b9b4484585e9307f7c60257ca27dd5ab",
  targets: ["production", "preview"],
})

new vercel.ProjectEnvironmentVariable("admin-cloudflare-api-token", {
  projectId: adminProject.id,
  key: "CLOUDFLARE_API_TOKEN",
  value: adminR2ApiToken,
  targets: ["production", "preview"],
})

new vercel.ProjectEnvironmentVariable("admin-data-bucket-name-prod", {
  projectId: adminProject.id,
  key: "DATA_BUCKET_NAME",
  value: "wortle-data",
  targets: ["production"],
})

new vercel.ProjectEnvironmentVariable("admin-data-bucket-name-preview", {
  projectId: adminProject.id,
  key: "DATA_BUCKET_NAME",
  value: "wortle-data-dev",
  targets: ["preview"],
})

new vercel.ProjectEnvironmentVariable("admin-originals-bucket-name-prod", {
  projectId: adminProject.id,
  key: "ORIGINALS_BUCKET_NAME",
  value: "wortle-originals",
  targets: ["production"],
})

new vercel.ProjectEnvironmentVariable("admin-originals-bucket-name-preview", {
  projectId: adminProject.id,
  key: "ORIGINALS_BUCKET_NAME",
  value: "wortle-originals-dev",
  targets: ["preview"],
})

new vercel.ProjectEnvironmentVariable("admin-images-bucket-name-prod", {
  projectId: adminProject.id,
  key: "IMAGES_BUCKET_NAME",
  value: "wortle-images",
  targets: ["production"],
})

new vercel.ProjectEnvironmentVariable("admin-images-bucket-name-preview", {
  projectId: adminProject.id,
  key: "IMAGES_BUCKET_NAME",
  value: "wortle-images-dev",
  targets: ["preview"],
})

// Cron secret for admin cron jobs
const cronSecret = new random.RandomPassword("admin-cron-secret", { length: 32 })

new vercel.ProjectEnvironmentVariable("admin-cron-secret", {
  projectId: adminProject.id,
  key: "CRON_SECRET",
  value: cronSecret.result,
  targets: ["production", "preview"],
})

// Kinde auth environment variables for admin
const kindeClientSecret = config.requireSecret("kinde-client-secret")

new vercel.ProjectEnvironmentVariable("admin-kinde-client-id", {
  projectId: adminProject.id,
  key: "KINDE_CLIENT_ID",
  value: "7fcfc9e6121143bbaead8f08a317c8da",
  targets: ["production", "preview"],
})

new vercel.ProjectEnvironmentVariable("admin-kinde-client-secret", {
  projectId: adminProject.id,
  key: "KINDE_CLIENT_SECRET",
  value: kindeClientSecret,
  targets: ["production", "preview"],
})

new vercel.ProjectEnvironmentVariable("admin-kinde-issuer-url", {
  projectId: adminProject.id,
  key: "KINDE_ISSUER_URL",
  value: "https://wortle.kinde.com",
  targets: ["production", "preview"],
})

new vercel.ProjectEnvironmentVariable("admin-kinde-site-url", {
  projectId: adminProject.id,
  key: "KINDE_SITE_URL",
  value: "https://admin.wortle.app",
  targets: ["production", "preview"],
})

new vercel.ProjectEnvironmentVariable("admin-kinde-post-logout-redirect", {
  projectId: adminProject.id,
  key: "KINDE_POST_LOGOUT_REDIRECT_URL",
  value: "https://admin.wortle.app",
  targets: ["production", "preview"],
})

new vercel.ProjectEnvironmentVariable("admin-kinde-post-login-redirect", {
  projectId: adminProject.id,
  key: "KINDE_POST_LOGIN_REDIRECT_URL",
  value: "https://admin.wortle.app",
  targets: ["production", "preview"],
})
