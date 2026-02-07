import { DbPuzzle } from "@/db/puzzleTypes"

import { ApiPuzzle, CreatePuzzleRequest, EditPuzzleRequest } from "./puzzleTypes"

export const dbPuzzleToApiPuzzle = (puzzle: DbPuzzle): ApiPuzzle => ({
  id: puzzle.id,
  speciesId: puzzle.speciesId,
  observationDate: puzzle.observationDate,
  location: puzzle.location,
  habitat: puzzle.habitat,
  images: puzzle.images,
  photoAttribution: puzzle.photoAttribution,
})

export const createPuzzleRequestToDbPuzzle = (puzzle: CreatePuzzleRequest): DbPuzzle => ({
  id: puzzle.id,
  speciesId: puzzle.speciesId,
  observationDate: puzzle.observationDate,
  location: puzzle.location,
  habitat: puzzle.habitat,
  images: puzzle.images.map(({ imageKey, caption, mediaType }) => ({ imageKey, caption, mediaType })),
  photoAttribution: puzzle.photoAttribution,
})

export const editPuzzleRequestToDbPuzzle: (puzzle: EditPuzzleRequest) => DbPuzzle = createPuzzleRequestToDbPuzzle
