import { createFileRoute, notFound } from "@tanstack/react-router"

import { ErrorFallback } from "@/components/error/ErrorFallback"
import { NotFoundPage } from "@/components/notFound/NotFoundPage"
import { PuzzleMode, PuzzlePage } from "@/components/puzzle/PuzzlePage"
import { PuzzleId } from "@/lib/Puzzle"

export const Route = createFileRoute("/review/$puzzleId")({
  loader: ({ params, context }) => {
    const puzzleId = PuzzleId(parseInt(params.puzzleId, 10))
    const puzzle = context.puzzles.findPuzzle(puzzleId)
    if (!puzzle) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router pattern
      throw notFound()
    }
    return { puzzle }
  },
  component: () => <PuzzlePageWrapper />,
  notFoundComponent: () => (
    <NotFoundPage message="This puzzle doesn't exist. Please choose a puzzle from the home page." />
  ),
  errorComponent: ({ error }) => <ErrorFallback error={error} />,
})

const PuzzlePageWrapper = () => {
  const { puzzle } = Route.useLoaderData()
  return <PuzzlePage puzzle={puzzle} mode={PuzzleMode.REVIEW} />
}
