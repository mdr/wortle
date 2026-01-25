import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type ReactNode } from "react"

import { logger } from "@/utils/Logger"

const createQueryClient = (disableRetries: boolean) =>
  new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        logger.error(
          "query.error",
          `Query failed: ${JSON.stringify(query.queryKey)}`,
          { queryKey: query.queryKey },
          error,
        )
      },
    }),
    defaultOptions: {
      queries: {
        retry: disableRetries ? 0 : 3,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      },
    },
  })

interface QueryProviderProps {
  children: ReactNode
  disableRetries?: boolean
}

export const QueryProvider = ({ children, disableRetries = false }: QueryProviderProps) => (
  <QueryClientProvider client={createQueryClient(disableRetries)}>{children}</QueryClientProvider>
)
