import type { Species, SpeciesData } from "@wortle/shared"

import type { DbSpecies } from "./types"

export const toSpecies = (dbSpecies: DbSpecies): Species => ({
  id: dbSpecies.id,
  scientificName: dbSpecies.scientificName,
  family: dbSpecies.family,
  commonName: dbSpecies.commonName,
  alternativeCommonNames: dbSpecies.alternativeCommonNames,
  links: dbSpecies.links,
  idTips: dbSpecies.idTips,
})

export const toSpeciesData = (dbSpecies: DbSpecies[]): SpeciesData => ({
  species: dbSpecies.map(toSpecies),
})
