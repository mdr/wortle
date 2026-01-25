import { type Puzzles } from "@/lib/puzzles"
import { type Schedule } from "@/lib/schedule"
import { type SpeciesRepository } from "@/lib/species/Species"
import { logger } from "@/utils/Logger"

export const validateDataReferences = (
  schedule: Schedule,
  puzzles: Puzzles,
  speciesRepository: SpeciesRepository,
): void => {
  validateSchedulePuzzleIds(schedule, puzzles)
  validatePuzzleSpeciesIds(puzzles, speciesRepository)
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

const validatePuzzleSpeciesIds = (puzzles: Puzzles, speciesRepository: SpeciesRepository): void => {
  for (const puzzleId of puzzles.getAllPuzzleIds()) {
    const puzzle = puzzles.getPuzzle(puzzleId)
    if (speciesRepository.findSpecies(puzzle.speciesId) === undefined) {
      logger.warn("data.invalidSpeciesId", `Puzzle references unknown species ID: ${puzzle.speciesId}`, {
        puzzleId: puzzle.id,
        speciesId: puzzle.speciesId,
      })
    }
  }
}
