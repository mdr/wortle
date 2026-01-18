import { ReactNode, useMemo } from "react"

import { HistoryStore } from "@/lib/gameStorage/HistoryStore"
import { Puzzle } from "@/lib/Puzzle"
import { Iso8601Date } from "@/utils/brandedTypes"

import { PuzzleMode, PuzzleService } from "./PuzzleService"
import { PuzzleServiceContext } from "./puzzleServiceHooks"

interface PuzzleServiceProviderProps {
  puzzle: Puzzle
  scheduledDate?: Iso8601Date
  mode: PuzzleMode
  historyStore: HistoryStore
  children: ReactNode
}

export const PuzzleServiceProvider = ({
  puzzle,
  scheduledDate,
  mode,
  historyStore,
  children,
}: PuzzleServiceProviderProps) => {
  const service = useMemo(
    () => new PuzzleService(puzzle, scheduledDate, mode, historyStore),
    [puzzle, scheduledDate, mode, historyStore],
  )

  return <PuzzleServiceContext.Provider value={service}>{children}</PuzzleServiceContext.Provider>
}
