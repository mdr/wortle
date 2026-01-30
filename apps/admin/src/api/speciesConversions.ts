import { DbSpecies } from "@/db/types"

import { ApiSpecies } from "./types"

export const toApiSpecies = (species: DbSpecies): ApiSpecies => ({
  id: species.id,
  scientificName: species.scientificName,
  family: species.family,
  commonName: species.commonName,
  alternativeCommonNames: species.alternativeCommonNames,
  links: species.links,
  idTips: species.idTips,
})

export const toDbSpecies = (species: ApiSpecies): DbSpecies => ({
  id: species.id,
  scientificName: species.scientificName,
  family: species.family,
  commonName: species.commonName,
  alternativeCommonNames: species.alternativeCommonNames,
  links: species.links,
  idTips: species.idTips,
})
