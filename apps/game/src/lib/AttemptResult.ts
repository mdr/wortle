import { type Species, type SpeciesId } from "@wortle/shared"

import { getGenus } from "./species/Species"

export interface AttemptResult {
  speciesId: SpeciesId
  isCorrect: boolean
  genusMatch: boolean
  familyMatch: boolean
}

export const createAttemptResult = (attemptedSpecies: Species, correctSpecies: Species): AttemptResult => ({
  speciesId: attemptedSpecies.id,
  isCorrect: attemptedSpecies.id === correctSpecies.id,
  genusMatch: getGenus(attemptedSpecies.scientificName) === getGenus(correctSpecies.scientificName),
  familyMatch: attemptedSpecies.family === correctSpecies.family,
})
