import { createFileRoute, notFound, redirect } from "@tanstack/react-router"

import { ErrorFallback } from "@/components/error/ErrorFallback"
import { NotFoundPage } from "@/components/notFound/NotFoundPage"
import { PuzzleMode, PuzzlePage } from "@/components/puzzle/PuzzlePage"
import { Puzzle } from "@/lib/Puzzle"
import { Iso8601Date } from "@/utils/brandedTypes"

interface ArchivePuzzleData {
  scheduledDate: Iso8601Date
  puzzle?: Puzzle
}

export const Route = createFileRoute("/archive/$date")({
  loader: ({ params, context }): ArchivePuzzleData => {
    if (!Iso8601Date.is(params.date)) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router pattern
      throw redirect({ to: "/history" })
    }
    const scheduledDate = params.date
    const puzzleId = context.schedule.findPuzzleForDate(scheduledDate)

    if (!puzzleId) {
      return { scheduledDate }
    }

    const puzzle = context.puzzles.findPuzzle(puzzleId)
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

  if (!puzzle) {
    return <NotFoundPage message="No puzzle was scheduled for this date." />
  }

  return <PuzzlePage puzzle={puzzle} scheduledDate={scheduledDate} mode={PuzzleMode.ARCHIVE} />
}
