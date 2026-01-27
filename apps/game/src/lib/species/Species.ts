import { Genus, type Option, ScientificName, type Species, type SpeciesId } from "@wortle/shared"
import { assert } from "tsafe"

export {
  CommonName,
  Family,
  Genus,
  type Option,
  ScientificName,
  type Species,
  type SpeciesData,
  SpeciesId,
  speciesJsonSchema,
  type SpeciesLink,
  Url,
} from "@wortle/shared"

export const getGenus = (scientificName: ScientificName): Genus => Genus(scientificName.split(" ")[0])

const matchesQuery = (species: Species, query: string): boolean => {
  const lowerQuery = query.toLowerCase()
  const allNames = [species.commonName, ...species.alternativeCommonNames, species.scientificName]
  return allNames.some((name) => name.toLowerCase().includes(lowerQuery))
}

export const filterSpecies = (species: Species[], query: string, excludedIds: SpeciesId[] = []): Species[] =>
  species.filter((s) => !excludedIds.includes(s.id) && matchesQuery(s, query))

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
