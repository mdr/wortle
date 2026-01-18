import { ReactNode, useMemo } from "react"

import { DailyPuzzleRecord } from "@/lib/gameStorage/GameState"
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
  completionRecord?: DailyPuzzleRecord
  children: ReactNode
}

export const PuzzleServiceProvider = ({
  puzzle,
  scheduledDate,
  mode,
  gameStorage,
  completionRecord,
  children,
}: PuzzleServiceProviderProps) => {
  const service = useMemo(() => {
    return new PuzzleService(
      {
        puzzle,
        scheduledDate,
      },
      {
        mode,
        gameStorage,
        completionRecord,
      },
    )
  }, [puzzle, scheduledDate, mode, gameStorage, completionRecord])

  return <PuzzleServiceContext.Provider value={service}>{children}</PuzzleServiceContext.Provider>
}
