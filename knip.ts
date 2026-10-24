import type { KnipConfig } from "knip"

const config: KnipConfig = {
  workspaces: {
    "apps/game": {
      entry: ["src/routes/**/*.tsx!", "scripts/*.ts"],
      project: ["src/**/*.{ts,tsx,css}!", "src/tests/**/*.{ts,tsx}", "**/*.testUtils.ts", "scripts/**/*.ts"],
      // vitest-monocart-coverage is referenced by string as the custom coverage provider in vite.config.ts
      ignoreDependencies: ["autoprefixer", "vitest-monocart-coverage", "@vitest/coverage-custom"],
      "playwright-ct": {
        config: [],
      },
    },
  },
  ignoreExportsUsedInFile: true,
}

export default config
