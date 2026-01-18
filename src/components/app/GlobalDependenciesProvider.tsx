import { type ReactNode } from "react"

import { GameStorage } from "@/lib/gameStorage/GameStorage"
import { defaultSchedule, type Schedule } from "@/lib/schedule"
import { type Clock, defaultClock } from "@/utils/Clock"
import { createOptionalContext, useService } from "@/utils/providerish/serviceHooks"

export interface GlobalDependencies {
  clock: Clock
  schedule: Schedule
  gameStorage: GameStorage
}

export const GlobalDependenciesContext = createOptionalContext<GlobalDependencies>()

export const useGlobalDependencies = (): GlobalDependencies => useService(GlobalDependenciesContext)

export const useClock = (): Clock => useGlobalDependencies().clock

export const useSchedule = (): Schedule => useGlobalDependencies().schedule

export const useGameStorage = (): GameStorage => useGlobalDependencies().gameStorage

export const defaultGlobalDependencies: GlobalDependencies = {
  clock: defaultClock,
  schedule: defaultSchedule,
  gameStorage: new GameStorage(window.localStorage),
}

interface GlobalDependenciesProviderProps {
  dependencies: GlobalDependencies
  children: ReactNode
}

export const GlobalDependenciesProvider = ({ dependencies, children }: GlobalDependenciesProviderProps) => (
  <GlobalDependenciesContext.Provider value={dependencies}>{children}</GlobalDependenciesContext.Provider>
)
