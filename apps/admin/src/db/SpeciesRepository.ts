import { Option } from "@wortle/shared"
import { eq } from "drizzle-orm"

import { ApiSpecies } from "@/api/types"

import { db } from "./index"
import { species } from "./schema"
import { SpeciesId } from "./types"

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

class SpeciesRepository {
  list = async (): Promise<ApiSpecies[]> => {
    const rows = await db.select().from(species)
    return rows.map((row) => row.data)
  }

  findById = async (id: SpeciesId): Promise<Option<ApiSpecies>> => {
    const rows = await db.select().from(species).where(eq(species.id, id))
    return rows[0]?.data
  }

  create = async (data: ApiSpecies): Promise<CreateResult> => {
    return await db.transaction(async (tx) => {
      const existing = await tx.select({ id: species.id }).from(species).where(eq(species.id, data.id))
      if (existing.length > 0) {
        return CreateResult.ALREADY_EXISTS
      }
      await tx.insert(species).values({ id: data.id, data })
      return CreateResult.CREATED
    })
  }

  update = async (data: ApiSpecies): Promise<UpdateResult> => {
    const result = await db.update(species).set({ data }).where(eq(species.id, data.id)).returning()
    return result.length > 0 ? UpdateResult.UPDATED : UpdateResult.NOT_FOUND
  }

  delete = async (id: SpeciesId): Promise<DeleteResult> => {
    const result = await db.delete(species).where(eq(species.id, id)).returning()
    return result.length > 0 ? DeleteResult.DELETED : DeleteResult.NOT_FOUND
  }
}

export const speciesRepository = new SpeciesRepository()
