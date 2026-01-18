import { ReactNode, useMemo } from "react"

import { GameStorage } from "@/lib/gameStorage/GameStorage"
import { Puzzle } from "@/lib/Puzzle"
import { Iso8601Date } from "@/utils/brandedTypes"

import { PuzzleMode, PuzzleService } from "./PuzzleService"
import { PuzzleServiceContext } from "./puzzleServiceHooks"

interface PuzzleServiceProviderProps {
  puzzle: Puzzle
  scheduledDate?: Iso8601Date
  mode: PuzzleMode
  gameStorage: GameStorage
  children: ReactNode
}

export const PuzzleServiceProvider = ({
  puzzle,
  scheduledDate,
  mode,
  gameStorage,
  children,
}: PuzzleServiceProviderProps) => {
  const service = useMemo(
    () => new PuzzleService(puzzle, scheduledDate, mode, gameStorage),
    [puzzle, scheduledDate, mode, gameStorage],
  )

  return <PuzzleServiceContext.Provider value={service}>{children}</PuzzleServiceContext.Provider>
}
