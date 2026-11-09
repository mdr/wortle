import type { KnipConfig } from "knip"

const config: KnipConfig = {
  workspaces: {
    "apps/game": {
      entry: ["src/routes/**/*.tsx!", "scripts/*.ts"],
      project: ["src/**/*.{ts,tsx,css}!", "src/tests/**/*.{ts,tsx}", "**/*.testUtils.ts", "scripts/**/*.ts"],
      // vitest-monocart-coverage is referenced by string as the custom coverage provider in vite.config.ts.
      // world-atlas is resolved by path in OfflineWorld.testUtils.ts, as the IWFTs' stand-in for its CDN copy.
      ignoreDependencies: ["autoprefixer", "vitest-monocart-coverage", "@vitest/coverage-custom", "world-atlas"],
      "playwright-ct": {
        config: [],
      },
    },
  },
  ignoreExportsUsedInFile: true,
}

export default config
