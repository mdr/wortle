import { Link } from "@tanstack/react-router"

import { usePuzzles, useSchedule, useSpeciesRepository } from "@/components/app/GlobalDependenciesProvider"
import { type PuzzleHistoryEntry } from "@/lib/gameStorage/HistoryRecord"
import { getResultDescription, getResultMedal } from "@/lib/resultMedal"
import { formatDate } from "@/utils/dateUtils"

import { HistoryTestIds } from "./HistoryTestIds"

interface HistoryItemProps {
  entry: PuzzleHistoryEntry
  isToday?: boolean
}

export const HistoryItem = ({ entry, isToday }: HistoryItemProps) => {
  const schedule = useSchedule()
  const puzzles = usePuzzles()
  const speciesRepository = useSpeciesRepository()
  const puzzleId = schedule.findPuzzleForDate(entry.date)
  if (!puzzleId) return null

  const puzzle = puzzles.getPuzzle(puzzleId)
  const species = speciesRepository.getSpecies(puzzle.speciesId)
  const speciesName = species.commonName
  const attemptCount = entry.submittedSpecies.length

  return (
    <Link to="/archive/$date" params={{ date: entry.date }} data-testid={HistoryTestIds.item} className="block">
      <div className="bg-muted hover:bg-muted/80 flex items-center justify-between rounded-lg p-4 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">
            {getResultMedal({ attemptCount, result: entry.result, isToday })}
          </span>
          <span className="sr-only">{getResultDescription({ attemptCount, result: entry.result, isToday })}:</span>
          <div>
            <p className="text-foreground font-medium">{speciesName}</p>
            <p className="text-foreground/70 text-xs">{formatDate(entry.date)}</p>
          </div>
        </div>
        <div className="text-foreground/70 text-sm">
          {attemptCount} {attemptCount === 1 ? "attempt" : "attempts"}
        </div>
      </div>
    </Link>
  )
}
