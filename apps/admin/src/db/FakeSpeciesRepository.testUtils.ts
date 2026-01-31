import { Option } from "@wortle/shared"

import { CreateResult, DeleteResult, ISpeciesRepository, UpdateResult } from "./SpeciesRepository"
import { DbSpecies, SpeciesId } from "./types"

export class FakeSpeciesRepository implements ISpeciesRepository {
  private species: Map<SpeciesId, DbSpecies> = new Map()

  list = (): Promise<DbSpecies[]> => Promise.resolve([...this.species.values()])

  findById = (id: SpeciesId): Promise<Option<DbSpecies>> => Promise.resolve(this.species.get(id))

  create = (data: DbSpecies): Promise<CreateResult> => {
    if (this.species.has(data.id)) {
      return Promise.resolve(CreateResult.ALREADY_EXISTS)
    }
    this.species.set(data.id, data)
    return Promise.resolve(CreateResult.CREATED)
  }

  update = (data: DbSpecies): Promise<UpdateResult> => {
    if (!this.species.has(data.id)) {
      return Promise.resolve(UpdateResult.NOT_FOUND)
    }
    this.species.set(data.id, data)
    return Promise.resolve(UpdateResult.UPDATED)
  }

  delete = (id: SpeciesId): Promise<DeleteResult> => {
    if (!this.species.has(id)) {
      return Promise.resolve(DeleteResult.NOT_FOUND)
    }
    this.species.delete(id)
    return Promise.resolve(DeleteResult.DELETED)
  }
}
