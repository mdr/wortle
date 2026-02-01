import type { Species, SpeciesData } from "@wortle/shared"

import type { DbSpecies } from "./types"

export const dbSpeciesToSpecies = (dbSpecies: DbSpecies): Species => ({
  id: dbSpecies.id,
  scientificName: dbSpecies.scientificName,
  family: dbSpecies.family,
  commonName: dbSpecies.commonName,
  alternativeCommonNames: dbSpecies.alternativeCommonNames,
  alternativeScientificNames: dbSpecies.alternativeScientificNames,
  links: dbSpecies.links,
  idTips: dbSpecies.idTips,
})

export const dbSpeciesToSpeciesData = (dbSpecies: DbSpecies[]): SpeciesData => ({
  species: dbSpecies.map(dbSpeciesToSpecies).toSorted((a, b) => a.scientificName.localeCompare(b.scientificName)),
})
