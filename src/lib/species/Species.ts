import { Brand } from "effect"

import { Url } from "@/utils/brandedTypes"

export type SpeciesId = string & Brand.Brand<"SpeciesId">
export const SpeciesId = Brand.nominal<SpeciesId>()

export interface SpeciesLink {
  name: string
  url: Url
}

export interface Species {
  id: SpeciesId
  scientificName: string
  family: string
  commonName: string
  alternativeCommonNames: string[]
  links: SpeciesLink[]
  idTips: string[]
}

export const getGenus = (scientificName: string): string => scientificName.split(" ")[0]

const matchesQuery = (species: Species, query: string): boolean => {
  const lowerQuery = query.toLowerCase()
  const allNames = [species.commonName, ...species.alternativeCommonNames, species.scientificName]
  return allNames.some((name) => name.toLowerCase().includes(lowerQuery))
}

export const filterSpecies = (species: Species[], query: string, excludedIds: SpeciesId[] = []): Species[] =>
  species.filter((s) => !excludedIds.includes(s.id) && matchesQuery(s, query))
