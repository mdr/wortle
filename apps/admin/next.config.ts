import type { NextConfig } from "next"

import "./src/env"

const nextConfig: NextConfig = {
  transpilePackages: ["@wortle/ui"],
}

export default nextConfig
