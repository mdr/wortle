import { createFileRoute, notFound } from "@tanstack/react-router"

import { useHistoryStore } from "@/components/app/GlobalDependenciesProvider"
import { ErrorFallback } from "@/components/error/ErrorFallback"
import { NotFoundPage } from "@/components/notFound/NotFoundPage"
import { PuzzlePage } from "@/components/puzzle/PuzzlePage"
import { Puzzle } from "@/lib/Puzzle"
import { findPuzzle } from "@/lib/puzzles"
import { PuzzleMode } from "@/services/puzzle/PuzzleService"
import { PuzzleServiceProvider } from "@/services/puzzle/PuzzleServiceProvider"
import { Iso8601Date } from "@/utils/brandedTypes"

interface ArchivePuzzleData {
  scheduledDate: Iso8601Date
  puzzle?: Puzzle
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

    return { puzzle, scheduledDate }
  },
  component: () => <ArchivePuzzlePage />,
  notFoundComponent: () => <NotFoundPage message="This puzzle doesn't exist." />,
  errorComponent: ({ error }) => <ErrorFallback error={error} />,
})

const ArchivePuzzlePage = () => {
  const { puzzle, scheduledDate } = Route.useLoaderData()
  const historyStore = useHistoryStore()

  if (!puzzle) {
    return <NotFoundPage message="No puzzle was scheduled for this date." />
  }

  return (
    <PuzzleServiceProvider
      puzzle={puzzle}
      scheduledDate={scheduledDate}
      mode={PuzzleMode.ARCHIVE}
      historyStore={historyStore}
    >
      <PuzzlePage />
    </PuzzleServiceProvider>
  )
}
