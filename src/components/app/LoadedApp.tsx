import { RouterProvider } from "@tanstack/react-router"
import { useMemo } from "react"

import { HistoryStore } from "@/lib/gameStorage/HistoryStore"
import { createAppRouter } from "@/lib/router"
import { type Schedule } from "@/lib/schedule"
import { defaultClock } from "@/utils/Clock"

import { type GlobalDependencies, GlobalDependenciesProvider } from "./GlobalDependenciesProvider"
import { TestHooksProvider } from "./TestHooksProvider"

interface LoadedAppProps {
  schedule: Schedule
  initialPath?: string
}

export const LoadedApp = ({ schedule, initialPath }: LoadedAppProps) => {
  const dependencies: GlobalDependencies = useMemo(
    () => ({
      clock: defaultClock,
      schedule,
      historyStore: new HistoryStore(window.localStorage),
    }),
    [schedule],
  )

  const router = useMemo(() => createAppRouter(dependencies, initialPath), [dependencies, initialPath])

  return (
    <GlobalDependenciesProvider dependencies={dependencies}>
      <TestHooksProvider>
        <RouterProvider router={router} />
      </TestHooksProvider>
    </GlobalDependenciesProvider>
  )
}
