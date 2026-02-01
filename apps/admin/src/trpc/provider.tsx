"use client"

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { httpBatchLink, TRPCClientError } from "@trpc/client"
import { useState } from "react"

import { clientLogger } from "@/utils/logger"

import { trpc } from "./client"

const getTrpcPath = (key: unknown): string => (Array.isArray(key) ? key.join(".") : "unknown")

const getTrpcErrorCode = (error: Error): string | undefined => {
  if (!(error instanceof TRPCClientError)) return undefined
  const data: unknown = error.data
  if (typeof data === "object" && data !== null && "code" in data && typeof data.code === "string") {
    return data.code
  }
  return undefined
}

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3101"
}

export const TRPCProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            const path = getTrpcPath(query.queryKey[0])
            const code = getTrpcErrorCode(error)
            clientLogger.error(`trpc.${path}`, error.message, { code }, error)
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            const path = getTrpcPath(mutation.options.mutationKey?.[0])
            const code = getTrpcErrorCode(error)
            clientLogger.error(`trpc.${path}`, error.message, { code }, error)
          },
        }),
      }),
  )
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    }),
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
