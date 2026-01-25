import { Brand } from "effect"
import { assert, Equals } from "tsafe"
import { z } from "zod"

import { Url } from "@/utils/brandedTypes"
import { Option } from "@/utils/types/Option"

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

const speciesLinkSchema = z.object({
  name: z.string(),
  url: z.string().transform(Url),
})

const speciesSchema = z.object({
  id: z.string().transform(SpeciesId),
  scientificName: z.string().transform(ScientificName),
  family: z.string().transform(Family),
  commonName: z.string().transform(CommonName),
  alternativeCommonNames: z.array(z.string().transform(CommonName)),
  links: z.array(speciesLinkSchema),
  idTips: z.array(z.string()),
})

export const speciesJsonSchema = z.object({
  species: z.array(speciesSchema),
})

export interface SpeciesData {
  species: Species[]
}

type InferredSpeciesData = z.infer<typeof speciesJsonSchema>
assert<Equals<InferredSpeciesData, SpeciesData>>()

export interface SpeciesRepository {
  findSpecies: (id: SpeciesId) => Option<Species>
  getSpecies: (id: SpeciesId) => Species
  getAllSpecies: () => Species[]
  filterSpecies: (query: string, excludedIds?: SpeciesId[]) => Species[]
}

export class DefaultSpeciesRepository implements SpeciesRepository {
  constructor(private readonly species: Species[]) {}

  findSpecies = (id: SpeciesId): Option<Species> => this.species.find((s) => s.id === id)

  getSpecies = (id: SpeciesId): Species => {
    const species = this.findSpecies(id)
    assert(species, `Unknown species id: ${id}`)
    return species
  }

  getAllSpecies = (): Species[] => this.species

  filterSpecies = (query: string, excludedIds: SpeciesId[] = []): Species[] =>
    filterSpecies(this.species, query, excludedIds)
}
