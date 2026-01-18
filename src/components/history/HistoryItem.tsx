import { Link } from "@tanstack/react-router"

import { type DailyPuzzleRecord, DailyResult } from "@/lib/gameStorage/GameState"
import { getPuzzle } from "@/lib/puzzles"
import { getResultDescription, getResultMedal } from "@/lib/resultMedal"
import { getSpecies } from "@/lib/species/plants"
import { formatDate } from "@/utils/dateUtils"

import { HistoryTestIds } from "./HistoryTestIds"

interface HistoryItemProps {
  record: DailyPuzzleRecord
}

export const HistoryItem = ({ record }: HistoryItemProps) => {
  const puzzle = getPuzzle(record.puzzleId)
  const species = getSpecies(puzzle.speciesId)
  const speciesName = species.commonName
  const isCorrect = record.result === DailyResult.PASS
  const attemptCount = record.attemptedSpeciesIds.length

  return (
    <Link to="/archive/$date" params={{ date: record.date }} data-testid={HistoryTestIds.item} className="block">
      <div className="bg-muted hover:bg-muted/80 flex items-center justify-between rounded-lg p-4 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">
            {getResultMedal({ attemptCount, isCorrect })}
          </span>
          <span className="sr-only">{getResultDescription({ attemptCount, isCorrect })}:</span>
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
