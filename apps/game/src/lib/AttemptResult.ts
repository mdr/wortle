import { getGenus, Species, SpeciesId } from "./species/Species"

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
