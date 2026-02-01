import { createFileRoute, notFound, redirect } from "@tanstack/react-router"
import { isIso8601Date, Iso8601Date, type Puzzle } from "@wortle/shared"

import { ErrorPage } from "@/components/pages/error/ErrorPage"
import { NotFoundPage } from "@/components/pages/notFound/NotFoundPage"
import { PuzzleMode, PuzzlePage } from "@/components/pages/puzzle/PuzzlePage"

interface ArchivePuzzleData {
  scheduledDate: Iso8601Date
  puzzle?: Puzzle
}

export const Route = createFileRoute("/archive/$date")({
  loader: ({ params, context }): ArchivePuzzleData => {
    if (!isIso8601Date(params.date)) {
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
  errorComponent: ({ error }) => <ErrorPage error={error} />,
})

const ArchivePuzzlePage = () => {
  const { puzzle, scheduledDate } = Route.useLoaderData()

  if (!puzzle) {
    return <NotFoundPage message="No puzzle was scheduled for this date." />
  }

  return <PuzzlePage puzzle={puzzle} scheduledDate={scheduledDate} mode={PuzzleMode.ARCHIVE} />
}
