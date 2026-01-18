import { createFileRoute, notFound } from "@tanstack/react-router"

import { useGameStorage } from "@/components/app/GlobalDependenciesProvider"
import { ErrorFallback } from "@/components/error/ErrorFallback"
import { NotFoundPage } from "@/components/notFound/NotFoundPage"
import { PuzzlePage } from "@/components/puzzle/PuzzlePage"
import { Puzzle } from "@/lib/Puzzle"
import { findPuzzle } from "@/lib/puzzles"
import { findSpecies } from "@/lib/species/plants"
import { PuzzleMode } from "@/services/puzzle/PuzzleService"
import { PuzzleServiceProvider } from "@/services/puzzle/PuzzleServiceProvider"
import { Iso8601Date } from "@/utils/brandedTypes"

interface DailyPuzzleData {
  scheduledDate: Iso8601Date
  puzzle?: Puzzle
}

export const Route = createFileRoute("/daily")({
  loader: ({ context }): DailyPuzzleData => {
    const scheduledDate = context.clock.todayIso()
    const puzzleId = context.schedule.findPuzzleForDate(scheduledDate)

    if (!puzzleId) {
      return { scheduledDate }
    }

    const puzzle = findPuzzle(puzzleId)
    if (!puzzle) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router pattern
      throw notFound()
    }
    if (!findSpecies(puzzle.speciesId)) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router pattern
      throw notFound()
    }

    return { puzzle, scheduledDate }
  },
  component: () => <DailyPuzzlePage />,
  notFoundComponent: () => <NotFoundPage message="Today's puzzle isn't available yet. Please check back later." />,
  errorComponent: ({ error }) => <ErrorFallback error={error} />,
})

const DailyPuzzlePage = () => {
  const { puzzle, scheduledDate } = Route.useLoaderData()
  const gameStorage = useGameStorage()
  if (!puzzle) {
    return <NotFoundPage message="No puzzle is scheduled for today." />
  }

  return (
    <PuzzleServiceProvider
      puzzle={puzzle}
      scheduledDate={scheduledDate}
      mode={PuzzleMode.DAILY}
      gameStorage={gameStorage}
    >
      <PuzzlePage />
    </PuzzleServiceProvider>
  )
}
