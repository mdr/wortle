import { type ReactNode } from "react"

import { HistoryStore } from "@/lib/gameStorage/HistoryStore"
import { type Puzzles } from "@/lib/puzzles"
import { type Schedule } from "@/lib/schedule"
import { type Clock } from "@/utils/Clock"
import { createOptionalContext, useService } from "@/utils/providerish/serviceHooks"

export interface GlobalDependencies {
  clock: Clock
  schedule: Schedule
  puzzles: Puzzles
  historyStore: HistoryStore
}

export const GlobalDependenciesContext = createOptionalContext<GlobalDependencies>()

export const useGlobalDependencies = (): GlobalDependencies => useService(GlobalDependenciesContext)

export const useClock = (): Clock => useGlobalDependencies().clock

export const useSchedule = (): Schedule => useGlobalDependencies().schedule

export const usePuzzles = (): Puzzles => useGlobalDependencies().puzzles

export const useHistoryStore = (): HistoryStore => useGlobalDependencies().historyStore

interface GlobalDependenciesProviderProps {
  dependencies: GlobalDependencies
  children: ReactNode
}

export const GlobalDependenciesProvider = ({ dependencies, children }: GlobalDependenciesProviderProps) => (
  <GlobalDependenciesContext.Provider value={dependencies}>{children}</GlobalDependenciesContext.Provider>
)
