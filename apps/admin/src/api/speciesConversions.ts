import { DbSpecies } from "@/db/types"

import { ApiSpecies } from "./types"

export const dbSpeciesToApiSpecies = (species: DbSpecies): ApiSpecies => ({
  id: species.id,
  scientificName: species.scientificName,
  family: species.family,
  commonName: species.commonName,
  alternativeCommonNames: species.alternativeCommonNames,
  alternativeScientificNames: species.alternativeScientificNames,
  links: species.links,
  idTips: species.idTips,
})

export const apiSpeciesToDbSpecies = (species: ApiSpecies): DbSpecies => ({
  id: species.id,
  scientificName: species.scientificName,
  family: species.family,
  commonName: species.commonName,
  alternativeCommonNames: species.alternativeCommonNames,
  alternativeScientificNames: species.alternativeScientificNames,
  links: species.links,
  idTips: species.idTips,
})
