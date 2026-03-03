import { Option } from "@wortle/shared"

import { CreateResult, DeleteResult, ITaxaRepository, UpdateResult } from "./TaxaRepository"
import { DbTaxon, TaxonId } from "./types"

export class FakeTaxaRepository implements ITaxaRepository {
  private taxa: Map<TaxonId, DbTaxon> = new Map()

  list = (): Promise<DbTaxon[]> => Promise.resolve([...this.taxa.values()])

  findById = (id: TaxonId): Promise<Option<DbTaxon>> => Promise.resolve(this.taxa.get(id))

  create = (data: DbTaxon): Promise<CreateResult> => {
    if (this.taxa.has(data.id)) {
      return Promise.resolve(CreateResult.ALREADY_EXISTS)
    }
    this.taxa.set(data.id, data)
    return Promise.resolve(CreateResult.CREATED)
  }

  update = (data: DbTaxon): Promise<UpdateResult> => {
    if (!this.taxa.has(data.id)) {
      return Promise.resolve(UpdateResult.NOT_FOUND)
    }
    this.taxa.set(data.id, data)
    return Promise.resolve(UpdateResult.UPDATED)
  }

  delete = (id: TaxonId): Promise<DeleteResult> => {
    if (!this.taxa.has(id)) {
      return Promise.resolve(DeleteResult.NOT_FOUND)
    }
    this.taxa.delete(id)
    return Promise.resolve(DeleteResult.DELETED)
  }
}
