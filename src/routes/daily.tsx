import { createFileRoute, notFound } from "@tanstack/react-router"

import { ErrorFallback } from "@/components/error/ErrorFallback"
import { NotFoundPage } from "@/components/notFound/NotFoundPage"
import { PuzzleMode, PuzzlePage } from "@/components/puzzle/PuzzlePage"
import { Puzzle } from "@/lib/Puzzle"
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

    const puzzle = context.puzzles.findPuzzle(puzzleId)
    if (!puzzle) {
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
  if (!puzzle) {
    return <NotFoundPage message="No puzzle is scheduled for today." />
  }

  return <PuzzlePage puzzle={puzzle} scheduledDate={scheduledDate} mode={PuzzleMode.DAILY} />
}
