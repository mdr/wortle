import { createFileRoute, notFound } from "@tanstack/react-router"
import { Iso8601Date, type Puzzle } from "@wortle/shared"

import { ErrorPage } from "@/components/pages/error/ErrorPage"
import { NotFoundPage } from "@/components/pages/notFound/NotFoundPage"
import { PuzzleMode, PuzzlePage } from "@/components/pages/puzzle/PuzzlePage"

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

    const puzzle = context.puzzles.findPuzzle(puzzleId)
    if (!puzzle) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router pattern
      throw notFound()
    }

    return { puzzle, scheduledDate }
  },
  component: () => <DailyPuzzlePage />,
  notFoundComponent: () => <NotFoundPage message="Today's puzzle isn't available yet. Please check back later." />,
  errorComponent: ({ error }) => <ErrorPage error={error} />,
})

const DailyPuzzlePage = () => {
  const { puzzle, scheduledDate } = Route.useLoaderData()
  if (!puzzle) {
    return <NotFoundPage message="No puzzle is scheduled for today." />
  }

  return <PuzzlePage puzzle={puzzle} scheduledDate={scheduledDate} mode={PuzzleMode.DAILY} />
}
