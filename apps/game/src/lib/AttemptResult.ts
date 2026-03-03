import { type Taxon, type TaxonId } from "@wortle/shared"

import { getGenus } from "./taxa/Taxon"

export interface AttemptResult {
  taxonId: TaxonId
  isCorrect: boolean
  genusMatch: boolean
  familyMatch: boolean
}

export const createAttemptResult = (attemptedTaxon: Taxon, correctTaxon: Taxon): AttemptResult => ({
  taxonId: attemptedTaxon.id,
  isCorrect: attemptedTaxon.id === correctTaxon.id,
  genusMatch: getGenus(attemptedTaxon.scientificName) === getGenus(correctTaxon.scientificName),
  familyMatch: attemptedTaxon.family === correctTaxon.family,
})
