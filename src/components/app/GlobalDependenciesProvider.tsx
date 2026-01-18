import { type ReactNode } from "react"

import { HistoryStore } from "@/lib/gameStorage/HistoryStore"
import { defaultSchedule, type Schedule } from "@/lib/schedule"
import { type Clock, defaultClock } from "@/utils/Clock"
import { createOptionalContext, useService } from "@/utils/providerish/serviceHooks"

export interface GlobalDependencies {
  clock: Clock
  schedule: Schedule
  historyStore: HistoryStore
}

export const GlobalDependenciesContext = createOptionalContext<GlobalDependencies>()

export const useGlobalDependencies = (): GlobalDependencies => useService(GlobalDependenciesContext)

export const useClock = (): Clock => useGlobalDependencies().clock

export const useSchedule = (): Schedule => useGlobalDependencies().schedule

export const useHistoryStore = (): HistoryStore => useGlobalDependencies().historyStore

export const defaultGlobalDependencies: GlobalDependencies = {
  clock: defaultClock,
  schedule: defaultSchedule,
  historyStore: new HistoryStore(window.localStorage),
}

interface GlobalDependenciesProviderProps {
  dependencies: GlobalDependencies
  children: ReactNode
}

export const GlobalDependenciesProvider = ({ dependencies, children }: GlobalDependenciesProviderProps) => (
  <GlobalDependenciesContext.Provider value={dependencies}>{children}</GlobalDependenciesContext.Provider>
)
