import * as vercel from "@pulumiverse/vercel"

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
