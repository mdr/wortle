import { fetchRequestHandler } from "@trpc/server/adapters/fetch"

import { createContext } from "@/trpc/init"
import { appRouter } from "@/trpc/router"
import { serverLogger } from "@/utils/logger"

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
    onError: ({ error, path }) => {
      serverLogger.error(`trpc.${path}`, error.message, { code: error.code }, error)
    },
  })

export { handler as GET, handler as POST }
