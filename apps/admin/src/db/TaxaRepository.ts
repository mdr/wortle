import { Option } from "@wortle/shared"
import { eq } from "drizzle-orm"
import { PgDatabase } from "drizzle-orm/pg-core"

import * as schema from "./schema"
import { taxa } from "./schema"
import { DbTaxon, dbTaxonSchema, TaxonId } from "./types"

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

const parseDbTaxon = (data: unknown): DbTaxon => dbTaxonSchema.parse(data)

export interface ITaxaRepository {
  list: () => Promise<DbTaxon[]>
  findById: (id: TaxonId) => Promise<Option<DbTaxon>>
  create: (data: DbTaxon) => Promise<CreateResult>
  update: (data: DbTaxon) => Promise<UpdateResult>
  delete: (id: TaxonId) => Promise<DeleteResult>
}

export class TaxaRepository implements ITaxaRepository {
  constructor(private readonly db: Database) {}

  list = async (): Promise<DbTaxon[]> => {
    const rows = await this.db.select().from(taxa)
    return rows.map((row) => parseDbTaxon(row.data))
  }

  findById = async (id: TaxonId): Promise<Option<DbTaxon>> => {
    const row = await this.db.query.taxa.findFirst({ where: eq(taxa.id, id) })
    return row ? parseDbTaxon(row.data) : undefined
  }

  create = async (data: DbTaxon): Promise<CreateResult> =>
    this.db.transaction(async (tx) => {
      const existing = await tx.select({ id: taxa.id }).from(taxa).where(eq(taxa.id, data.id))
      if (existing.length > 0) {
        return CreateResult.ALREADY_EXISTS
      }
      await tx.insert(taxa).values({ id: data.id, data })
      return CreateResult.CREATED
    })

  update = async (data: DbTaxon): Promise<UpdateResult> => {
    const result = await this.db.update(taxa).set({ data }).where(eq(taxa.id, data.id)).returning()
    return result.length > 0 ? UpdateResult.UPDATED : UpdateResult.NOT_FOUND
  }

  delete = async (id: TaxonId): Promise<DeleteResult> => {
    const result = await this.db.delete(taxa).where(eq(taxa.id, id)).returning()
    return result.length > 0 ? DeleteResult.DELETED : DeleteResult.NOT_FOUND
  }
}
