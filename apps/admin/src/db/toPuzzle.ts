import type { Puzzle, PuzzlesData } from "@wortle/shared"

import type { DbPuzzle } from "./puzzleTypes"

export const dbPuzzleToPuzzle = (dbPuzzle: DbPuzzle): Puzzle => ({
  id: dbPuzzle.id,
  speciesId: dbPuzzle.speciesId,
  observationDate: dbPuzzle.observationDate,
  location: dbPuzzle.location,
  habitat: dbPuzzle.habitat,
  images: dbPuzzle.images.map(({ imageKey, caption }) => ({ imageKey, caption })),
  photoAttribution: dbPuzzle.photoAttribution,
})

export const dbPuzzlesToPuzzlesData = (dbPuzzles: DbPuzzle[]): PuzzlesData => ({
  puzzles: dbPuzzles.map(dbPuzzleToPuzzle).toSorted((a, b) => a.id - b.id),
})
