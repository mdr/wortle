import { type Puzzles } from "@/lib/puzzles"
import { type Schedule } from "@/lib/schedule"
import { type TaxaRepository } from "@/lib/taxa/Taxon"
import { logger } from "@/utils/Logger"

export const validateDataReferences = (schedule: Schedule, puzzles: Puzzles, taxaRepository: TaxaRepository): void => {
  validateSchedulePuzzleIds(schedule, puzzles)
  validatePuzzleTaxonIds(puzzles, taxaRepository)
}

const validateSchedulePuzzleIds = (schedule: Schedule, puzzles: Puzzles): void => {
  for (const date of schedule.getAllScheduledDates()) {
    const puzzleId = schedule.findPuzzleForDate(date)
    if (puzzleId !== undefined && puzzles.findPuzzle(puzzleId) === undefined) {
      logger.warn("data.invalidPuzzleId", `Schedule references unknown puzzle ID: ${puzzleId}`, {
        date,
        puzzleId,
      })
    }
  }
}

const validatePuzzleTaxonIds = (puzzles: Puzzles, taxaRepository: TaxaRepository): void => {
  for (const puzzleId of puzzles.getAllPuzzleIds()) {
    const puzzle = puzzles.getPuzzle(puzzleId)
    if (taxaRepository.findTaxon(puzzle.speciesId) === undefined) {
      logger.warn("data.invalidTaxonId", `Puzzle references unknown taxon ID: ${puzzle.speciesId}`, {
        puzzleId: puzzle.id,
        speciesId: puzzle.speciesId,
      })
    }
  }
}
