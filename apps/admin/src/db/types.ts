import { CommonName, Family, ScientificName, SpeciesId, Url } from "@wortle/shared"

export { SpeciesId } from "@wortle/shared"

export interface DbSpeciesLink {
  name: string
  url: Url
}

export interface DbSpecies {
  id: SpeciesId
  scientificName: ScientificName
  family: Family
  commonName: CommonName
  alternativeCommonNames: CommonName[]
  links: DbSpeciesLink[]
  idTips: string[]
}
