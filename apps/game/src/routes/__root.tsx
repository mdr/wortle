import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"

import { ErrorPage } from "@/components/pages/error/ErrorPage"
import { NotFoundPage } from "@/components/pages/notFound/NotFoundPage"
import { type RouterContext } from "@/lib/router"

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <div className="font-sans antialiased">
      <Outlet />
    </div>
  ),
  notFoundComponent: () => <NotFoundPage />,
  errorComponent: ({ error }) => <ErrorPage error={error} />,
})
