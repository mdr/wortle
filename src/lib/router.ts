import { createMemoryHistory, createRouter } from "@tanstack/react-router"

import { type GlobalDependencies } from "@/components/app/GlobalDependenciesProvider"
import { type Puzzles } from "@/lib/puzzles"
import { type Schedule } from "@/lib/schedule"
import { routeTree } from "@/routeTree.gen"
import { type Clock } from "@/utils/Clock"

export interface RouterContext {
  clock: Clock
  schedule: Schedule
  puzzles: Puzzles
}

export const createAppRouter = (dependencies: GlobalDependencies, initialPath?: string) =>
  createRouter({
    routeTree,
    basepath: import.meta.env.BASE_URL,
    scrollRestoration: true,
    context: { clock: dependencies.clock, schedule: dependencies.schedule, puzzles: dependencies.puzzles },
    history: initialPath ? createMemoryHistory({ initialEntries: [initialPath] }) : undefined,
  })

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
