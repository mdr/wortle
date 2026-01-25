import { RouterProvider } from "@tanstack/react-router"
import { useMemo } from "react"

import { DebugDialog } from "@/components/debug/DebugDialog"
import { HistoryStore } from "@/lib/gameStorage/HistoryStore"
import { type Puzzles } from "@/lib/puzzles"
import { createAppRouter } from "@/lib/router"
import { type Schedule } from "@/lib/schedule"
import { type SpeciesRepository } from "@/lib/species/Species"
import { defaultClock } from "@/utils/Clock"

import { type GlobalDependencies, GlobalDependenciesProvider } from "./GlobalDependenciesProvider"
import { TestHooksProvider } from "./TestHooksProvider"

interface LoadedAppProps {
  schedule: Schedule
  puzzles: Puzzles
  speciesRepository: SpeciesRepository
  initialPath?: string
}

export const LoadedApp = ({ schedule, puzzles, speciesRepository, initialPath }: LoadedAppProps) => {
  const dependencies: GlobalDependencies = useMemo(
    () => ({
      clock: defaultClock,
      schedule,
      puzzles,
      historyStore: new HistoryStore(window.localStorage),
      speciesRepository,
    }),
    [schedule, puzzles, speciesRepository],
  )

  const router = useMemo(() => createAppRouter(dependencies, initialPath), [dependencies, initialPath])

  return (
    <GlobalDependenciesProvider dependencies={dependencies}>
      <TestHooksProvider>
        <RouterProvider router={router} />
      </TestHooksProvider>
      <DebugDialog />
    </GlobalDependenciesProvider>
  )
}
