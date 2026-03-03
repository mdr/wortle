import { filterTaxaByQuery, Genus, type Option, ScientificName, type Taxon, type TaxonId } from "@wortle/shared"
import { assert } from "tsafe"

export const getGenus = (scientificName: ScientificName): Genus => Genus(scientificName.split(" ")[0])

export const filterTaxa = filterTaxaByQuery

export interface TaxaRepository {
  findTaxon: (id: TaxonId) => Option<Taxon>
  getTaxon: (id: TaxonId) => Taxon
  getAllTaxa: () => Taxon[]
  filterTaxa: (query: string, excludedIds?: TaxonId[]) => Taxon[]
}

export class DefaultTaxaRepository implements TaxaRepository {
  constructor(private readonly taxa: Taxon[]) {}

  findTaxon = (id: TaxonId): Option<Taxon> => this.taxa.find((t) => t.id === id)

  getTaxon = (id: TaxonId): Taxon => {
    const taxon = this.findTaxon(id)
    assert(taxon, `Unknown taxon id: ${id}`)
    return taxon
  }

  getAllTaxa = (): Taxon[] => this.taxa

  filterTaxa = (query: string, excludedIds: TaxonId[] = []): Taxon[] => filterTaxa(this.taxa, query, excludedIds)
}
