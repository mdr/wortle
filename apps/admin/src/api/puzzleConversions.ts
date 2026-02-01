import { DbPuzzle } from "@/db/puzzleTypes"

import { ApiPuzzle } from "./puzzleTypes"

export const dbPuzzleToApiPuzzle = (puzzle: DbPuzzle): ApiPuzzle => ({
  id: puzzle.id,
  speciesId: puzzle.speciesId,
  observationDate: puzzle.observationDate,
  location: puzzle.location,
  habitat: puzzle.habitat,
  images: puzzle.images,
  photoAttribution: puzzle.photoAttribution,
})

export const apiPuzzleToDbPuzzle = (puzzle: ApiPuzzle): DbPuzzle => ({
  id: puzzle.id,
  speciesId: puzzle.speciesId,
  observationDate: puzzle.observationDate,
  location: puzzle.location,
  habitat: puzzle.habitat,
  images: puzzle.images,
  photoAttribution: puzzle.photoAttribution,
})
