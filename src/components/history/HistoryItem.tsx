import { Link } from "@tanstack/react-router"

import { type DailyPuzzleRecord, DailyResult } from "@/lib/gameStorage/GameState"
import { findPuzzle } from "@/lib/puzzles"
import { getResultDescription, getResultMedal } from "@/lib/resultMedal"
import { getSpecies } from "@/lib/species/plants"
import { formatDate } from "@/utils/dateUtils"

import { HistoryTestIds } from "./HistoryTestIds"

interface HistoryItemProps {
  record: DailyPuzzleRecord
}

export const HistoryItem = ({ record }: HistoryItemProps) => {
  const puzzle = findPuzzle(record.puzzleId)
  const species = puzzle ? getSpecies(puzzle.speciesId) : undefined
  const speciesName = species?.commonNames[0] ?? species?.scientificName ?? "Unknown"
  const isPassed = record.result === DailyResult.PASS
  const attemptCount = record.attemptedSpeciesIds.length

  return (
    <Link to="/archive/$date" params={{ date: record.date }} data-testid={HistoryTestIds.item} className="block">
      <div className="bg-muted hover:bg-muted/80 flex items-center justify-between rounded-lg p-4 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">
            {getResultMedal({ attemptCount, isCorrect: isPassed })}
          </span>
          <span className="sr-only">{getResultDescription({ attemptCount, isCorrect: isPassed })}:</span>
          <div>
            <p className="text-foreground font-medium">{speciesName}</p>
            <p className="text-foreground/70 text-xs">{formatDate(record.date)}</p>
          </div>
        </div>
        <div className="text-foreground/70 text-sm">
          {attemptCount} {attemptCount === 1 ? "attempt" : "attempts"}
        </div>
      </div>
    </Link>
  )
}
