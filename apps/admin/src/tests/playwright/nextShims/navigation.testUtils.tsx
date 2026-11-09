import { useMemo } from "react"

import { RouteParams, useTestRouter } from "./TestRouter.testUtils"

// Aliased to "next/navigation" in playwright-ct.config.ts.

export const useRouter = () => {
  const { push, back } = useTestRouter()
  return useMemo(
    () => ({ push, replace: push, back, refresh: () => undefined, prefetch: () => undefined }),
    [push, back],
  )
}

export const usePathname = (): string => useTestRouter().pathname

export const useParams = (): RouteParams => useTestRouter().match?.params ?? {}
