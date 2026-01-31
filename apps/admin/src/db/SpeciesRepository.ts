import { Option } from "@wortle/shared"
import { eq } from "drizzle-orm"
import { PgDatabase } from "drizzle-orm/pg-core"

import * as schema from "./schema"
import { species } from "./schema"
import { DbSpecies, SpeciesId } from "./types"

export enum CreateResult {
  CREATED = "CREATED",
  ALREADY_EXISTS = "ALREADY_EXISTS",
}

export enum UpdateResult {
  UPDATED = "UPDATED",
  NOT_FOUND = "NOT_FOUND",
}

export enum DeleteResult {
  DELETED = "DELETED",
  NOT_FOUND = "NOT_FOUND",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Database = PgDatabase<any, typeof schema>

export interface ISpeciesRepository {
  list: () => Promise<DbSpecies[]>
  findById: (id: SpeciesId) => Promise<Option<DbSpecies>>
  create: (data: DbSpecies) => Promise<CreateResult>
  update: (data: DbSpecies) => Promise<UpdateResult>
  delete: (id: SpeciesId) => Promise<DeleteResult>
}

export class SpeciesRepository implements ISpeciesRepository {
  constructor(private readonly db: Database) {}

  list = async (): Promise<DbSpecies[]> => {
    const rows = await this.db.select().from(species)
    return rows.map((row) => row.data)
  }

  findById = async (id: SpeciesId): Promise<Option<DbSpecies>> => {
    const rows = await this.db.select().from(species).where(eq(species.id, id))
    return rows[0]?.data
  }

  create = async (data: DbSpecies): Promise<CreateResult> =>
    this.db.transaction(async (tx) => {
      const existing = await tx.select({ id: species.id }).from(species).where(eq(species.id, data.id))
      if (existing.length > 0) {
        return CreateResult.ALREADY_EXISTS
      }
      await tx.insert(species).values({ id: data.id, data })
      return CreateResult.CREATED
    })

  update = async (data: DbSpecies): Promise<UpdateResult> => {
    const result = await this.db.update(species).set({ data }).where(eq(species.id, data.id)).returning()
    return result.length > 0 ? UpdateResult.UPDATED : UpdateResult.NOT_FOUND
  }

  delete = async (id: SpeciesId): Promise<DeleteResult> => {
    const result = await this.db.delete(species).where(eq(species.id, id)).returning()
    return result.length > 0 ? DeleteResult.DELETED : DeleteResult.NOT_FOUND
  }
}
