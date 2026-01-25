import type { KnipConfig } from "knip"

const config: KnipConfig = {
  entry: ["src/main.tsx!", "src/routes/**/*.tsx!", "scripts/*.ts"],
  project: ["src/**/*.{ts,tsx}!", "src/tests/**/*.{ts,tsx}", "**/*.testUtils.ts", "scripts/**/*.ts"],
  ignore: ["src/routeTree.gen.ts", "src/components/shadcn/**"],
  ignoreDependencies: ["autoprefixer", "tailwindcss"],
  ignoreExportsUsedInFile: true,
  "playwright-ct": {
    config: [],
  },
}

export default config
