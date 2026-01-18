import { createFileRoute, notFound } from "@tanstack/react-router"
import { useMemo } from "react"

import { useGameStorage } from "@/components/app/GlobalDependenciesProvider"
import { ErrorFallback } from "@/components/error/ErrorFallback"
import { NotFoundPage } from "@/components/notFound/NotFoundPage"
import { PuzzlePage } from "@/components/puzzle/PuzzlePage"
import { DailyPuzzleRecord } from "@/lib/gameStorage/GameState"
import { GameStorage } from "@/lib/gameStorage/GameStorage"
import { Puzzle } from "@/lib/Puzzle"
import { findPuzzle } from "@/lib/puzzles"
import { findSpecies } from "@/lib/species/plants"
import { Species } from "@/lib/species/Species"
import { PuzzleMode } from "@/services/puzzle/PuzzleService"
import { PuzzleServiceProvider } from "@/services/puzzle/PuzzleServiceProvider"
import { Iso8601Date } from "@/utils/brandedTypes"

interface ArchivePuzzleData {
  scheduledDate: Iso8601Date
  puzzle?: Puzzle
  correctSpecies?: Species
}

export const Route = createFileRoute("/archive/$date")({
  loader: ({ params, context }): ArchivePuzzleData => {
    const scheduledDate = Iso8601Date(params.date)
    const puzzleId = context.schedule.findPuzzleForDate(scheduledDate)

    if (!puzzleId) {
      return { scheduledDate }
    }

    const puzzle = findPuzzle(puzzleId)
    if (!puzzle) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router pattern
      throw notFound()
    }
    const correctSpecies = findSpecies(puzzle.speciesId)
    if (!correctSpecies) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router pattern
      throw notFound()
    }

    return { puzzle, correctSpecies, scheduledDate }
  },
  component: () => <ArchivePuzzlePage />,
  notFoundComponent: () => <NotFoundPage message="This puzzle doesn't exist." />,
  errorComponent: ({ error }) => <ErrorFallback error={error} />,
})

const findCompletionRecord = (storage: GameStorage, date: Iso8601Date): DailyPuzzleRecord | undefined =>
  storage.load().history.find((record) => record.date === date)

const ArchivePuzzlePage = () => {
  const { puzzle, correctSpecies, scheduledDate } = Route.useLoaderData()
  const gameStorage = useGameStorage()
  const completionRecord = useMemo(() => findCompletionRecord(gameStorage, scheduledDate), [gameStorage, scheduledDate])

  if (!puzzle || !correctSpecies) {
    return <NotFoundPage message="No puzzle was scheduled for this date." />
  }

  return (
    <PuzzleServiceProvider
      puzzle={puzzle}
      correctSpecies={correctSpecies}
      scheduledDate={scheduledDate}
      mode={PuzzleMode.ARCHIVE}
      gameStorage={gameStorage}
      completionRecord={completionRecord}
    >
      <PuzzlePage />
    </PuzzleServiceProvider>
  )
}
