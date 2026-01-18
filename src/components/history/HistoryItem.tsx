import { Link } from "@tanstack/react-router"

import { useSchedule } from "@/components/app/GlobalDependenciesProvider"
import { type PuzzleAttempt } from "@/lib/gameStorage/HistoryRecord"
import { getPuzzle } from "@/lib/puzzles"
import { getResultDescription, getResultMedal } from "@/lib/resultMedal"
import { getSpecies } from "@/lib/species/plants"
import { formatDate } from "@/utils/dateUtils"

import { HistoryTestIds } from "./HistoryTestIds"

interface HistoryItemProps {
  attempt: PuzzleAttempt
  isToday?: boolean
}

export const HistoryItem = ({ attempt, isToday }: HistoryItemProps) => {
  const schedule = useSchedule()
  const puzzleId = schedule.findPuzzleForDate(attempt.date)
  if (!puzzleId) return null

  const puzzle = getPuzzle(puzzleId)
  const species = getSpecies(puzzle.speciesId)
  const speciesName = species.commonName
  const attemptCount = attempt.submittedSpecies.length

  return (
    <Link to="/archive/$date" params={{ date: attempt.date }} data-testid={HistoryTestIds.item} className="block">
      <div className="bg-muted hover:bg-muted/80 flex items-center justify-between rounded-lg p-4 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">
            {getResultMedal({ attemptCount, result: attempt.result, isToday })}
          </span>
          <span className="sr-only">{getResultDescription({ attemptCount, result: attempt.result, isToday })}:</span>
          <div>
            <p className="text-foreground font-medium">{speciesName}</p>
            <p className="text-foreground/70 text-xs">{formatDate(attempt.date)}</p>
          </div>
        </div>
        <div className="text-foreground/70 text-sm">
          {attemptCount} {attemptCount === 1 ? "attempt" : "attempts"}
        </div>
      </div>
    </Link>
  )
}
