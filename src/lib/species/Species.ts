import { Brand } from "effect"

import { Url } from "@/utils/brandedTypes"

export type SpeciesId = string & Brand.Brand<"SpeciesId">
export const SpeciesId = Brand.nominal<SpeciesId>()

export type ScientificName = string & Brand.Brand<"ScientificName">
export const ScientificName = Brand.nominal<ScientificName>()

export type CommonName = string & Brand.Brand<"CommonName">
export const CommonName = Brand.nominal<CommonName>()

export type Genus = string & Brand.Brand<"Genus">
export const Genus = Brand.nominal<Genus>()

export type Family = string & Brand.Brand<"Family">
export const Family = Brand.nominal<Family>()

export interface SpeciesLink {
  name: string
  url: Url
}

export interface Species {
  id: SpeciesId
  scientificName: ScientificName
  family: Family
  commonName: CommonName
  alternativeCommonNames: CommonName[]
  links: SpeciesLink[]
  idTips: string[]
}

export const getGenus = (scientificName: ScientificName): Genus => Genus(scientificName.split(" ")[0])

const matchesQuery = (species: Species, query: string): boolean => {
  const lowerQuery = query.toLowerCase()
  const allNames = [species.commonName, ...species.alternativeCommonNames, species.scientificName]
  return allNames.some((name) => name.toLowerCase().includes(lowerQuery))
}

export const filterSpecies = (species: Species[], query: string, excludedIds: SpeciesId[] = []): Species[] =>
  species.filter((s) => !excludedIds.includes(s.id) && matchesQuery(s, query))
