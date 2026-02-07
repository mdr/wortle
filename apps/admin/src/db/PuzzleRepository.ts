import { Option, SpeciesId } from "@wortle/shared"
import { eq, inArray, sql } from "drizzle-orm"
import { PgDatabase } from "drizzle-orm/pg-core"

import * as schema from "./schema"
import { puzzles } from "./schema"
import { DbPuzzle, dbPuzzleSchema, PuzzleId } from "./puzzleTypes"

export interface PuzzleWithSyncStatus {
  puzzle: DbPuzzle
  imagesSynced: boolean
}

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

const parseDbPuzzle = (data: unknown): DbPuzzle => dbPuzzleSchema.parse(data)

export interface IPuzzleRepository {
  list: () => Promise<DbPuzzle[]>
  listWithSyncStatus: () => Promise<PuzzleWithSyncStatus[]>
  findById: (id: PuzzleId) => Promise<Option<DbPuzzle>>
  countBySpeciesId: (speciesId: SpeciesId) => Promise<number>
  create: (data: DbPuzzle) => Promise<CreateResult>
  update: (data: DbPuzzle) => Promise<UpdateResult>
  delete: (id: PuzzleId) => Promise<DeleteResult>
  markImagesSynced: (ids: PuzzleId[]) => Promise<void>
}

export class PuzzleRepository implements IPuzzleRepository {
  constructor(private readonly db: Database) {}

  list = async (): Promise<DbPuzzle[]> => {
    const rows = await this.db.select().from(puzzles)
    return rows.map((row) => parseDbPuzzle(row.data))
  }

  listWithSyncStatus = async (): Promise<PuzzleWithSyncStatus[]> => {
    const rows = await this.db.select().from(puzzles)
    return rows.map((row) => ({
      puzzle: parseDbPuzzle(row.data),
      imagesSynced: row.imagesSynced,
    }))
  }

  findById = async (id: PuzzleId): Promise<Option<DbPuzzle>> => {
    const row = await this.db.query.puzzles.findFirst({ where: eq(puzzles.id, id) })
    return row ? parseDbPuzzle(row.data) : undefined
  }

  countBySpeciesId = async (speciesId: SpeciesId): Promise<number> => {
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(puzzles)
      .where(sql`${puzzles.data}->>'speciesId' = ${speciesId}`)
    return count
  }

  create = async (data: DbPuzzle): Promise<CreateResult> =>
    this.db.transaction(async (tx) => {
      const existing = await tx.select({ id: puzzles.id }).from(puzzles).where(eq(puzzles.id, data.id))
      if (existing.length > 0) {
        return CreateResult.ALREADY_EXISTS
      }
      await tx.insert(puzzles).values({ id: data.id, data, imagesSynced: false })
      return CreateResult.CREATED
    })

  update = async (data: DbPuzzle): Promise<UpdateResult> => {
    const result = await this.db
      .update(puzzles)
      .set({ data, imagesSynced: false })
      .where(eq(puzzles.id, data.id))
      .returning()
    return result.length > 0 ? UpdateResult.UPDATED : UpdateResult.NOT_FOUND
  }

  markImagesSynced = async (ids: PuzzleId[]): Promise<void> => {
    if (ids.length === 0) return
    await this.db.update(puzzles).set({ imagesSynced: true }).where(inArray(puzzles.id, ids))
  }

  delete = async (id: PuzzleId): Promise<DeleteResult> => {
    const result = await this.db.delete(puzzles).where(eq(puzzles.id, id)).returning()
    return result.length > 0 ? DeleteResult.DELETED : DeleteResult.NOT_FOUND
  }
}
