import { filterSpeciesByQuery, Genus, type Option, ScientificName, type Species, type SpeciesId } from "@wortle/shared"
import { assert } from "tsafe"

export const getGenus = (scientificName: ScientificName): Genus => Genus(scientificName.split(" ")[0])

export const filterSpecies = filterSpeciesByQuery

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
