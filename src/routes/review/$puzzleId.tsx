import { createFileRoute, notFound } from "@tanstack/react-router"

import { useGameStorage } from "@/components/app/GlobalDependenciesProvider"
import { ErrorFallback } from "@/components/error/ErrorFallback"
import { NotFoundPage } from "@/components/notFound/NotFoundPage"
import { PuzzlePage } from "@/components/puzzle/PuzzlePage"
import { PuzzleId } from "@/lib/Puzzle"
import { findPuzzle } from "@/lib/puzzles"
import { PuzzleMode } from "@/services/puzzle/PuzzleService"
import { PuzzleServiceProvider } from "@/services/puzzle/PuzzleServiceProvider"

export const Route = createFileRoute("/review/$puzzleId")({
  loader: ({ params }) => {
    const puzzleId = PuzzleId(parseInt(params.puzzleId, 10))
    const puzzle = findPuzzle(puzzleId)
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
  const gameStorage = useGameStorage()
  return (
    <PuzzleServiceProvider puzzle={puzzle} mode={PuzzleMode.REVIEW} gameStorage={gameStorage}>
      <PuzzlePage showStatsPlaceholder />
    </PuzzleServiceProvider>
  )
}
