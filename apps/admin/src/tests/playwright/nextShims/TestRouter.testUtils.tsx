import { Option } from "@wortle/shared"
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"

// Stands in for the Next.js App Router so admin pages can render outside Next in IWFTs.

export type RouteParams = Record<string, string>

export interface TestRoute {
  // e.g. "/taxa/:id/edit"
  path: string
  render: () => ReactNode
}

interface MatchedRoute {
  route: TestRoute
  params: RouteParams
}

interface TestRouterValue {
  pathname: string
  match: Option<MatchedRoute>
  push: (href: string) => void
  back: () => void
}

const TestRouterContext = createContext<Option<TestRouterValue>>(undefined)

export const useTestRouter = (): TestRouterValue => {
  const value = useContext(TestRouterContext)
  if (value === undefined) throw new Error("useTestRouter must be used inside TestRouterProvider")
  return value
}

const findParams = (path: string, pathname: string): Option<RouteParams> => {
  const pathSegments = path.split("/")
  const pathnameSegments = pathname.split("/")
  if (pathSegments.length !== pathnameSegments.length) return undefined
  const params: RouteParams = {}
  for (const [index, segment] of pathSegments.entries()) {
    const actual = pathnameSegments[index]
    if (segment.startsWith(":")) params[segment.slice(1)] = decodeURIComponent(actual)
    else if (segment !== actual) return undefined
  }
  return params
}

const findRoute = (routes: TestRoute[], pathname: string): Option<MatchedRoute> => {
  for (const route of routes) {
    const params = findParams(route.path, pathname)
    if (params) return { route, params }
  }
  return undefined
}

interface TestRouterProviderProps {
  initialPath: string
  routes: TestRoute[]
  children: ReactNode
}

export const TestRouterProvider = ({ initialPath, routes, children }: TestRouterProviderProps) => {
  const [pathname, setPathname] = useState(() => {
    window.history.replaceState(null, "", initialPath)
    return initialPath
  })

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname)
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  const push = useCallback((href: string) => {
    window.history.pushState(null, "", href)
    setPathname(href)
  }, [])

  const back = useCallback(() => window.history.back(), [])

  const match = useMemo(() => findRoute(routes, pathname), [routes, pathname])
  const value = useMemo(() => ({ pathname, match, push, back }), [pathname, match, push, back])

  return <TestRouterContext value={value}>{children}</TestRouterContext>
}

export const TestRouteOutlet = () => {
  const { pathname, match } = useTestRouter()
  return match ? match.route.render() : <div>No test route for {pathname}</div>
}
