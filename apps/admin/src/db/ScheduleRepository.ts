import { Iso8601Date, Option, PuzzleId, ScheduleEntry } from "@wortle/shared"
import { eq } from "drizzle-orm"
import { PgDatabase } from "drizzle-orm/pg-core"

import * as schema from "./schema"
import { scheduleEntries } from "./schema"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Database = PgDatabase<any, typeof schema>

export interface IScheduleRepository {
  list: () => Promise<ScheduleEntry[]>
  findByDate: (date: Iso8601Date) => Promise<Option<ScheduleEntry>>
  listByPuzzleId: (puzzleId: PuzzleId) => Promise<ScheduleEntry[]>
  set: (date: Iso8601Date, puzzleId: PuzzleId) => Promise<void>
  remove: (date: Iso8601Date) => Promise<void>
}

export class ScheduleRepository implements IScheduleRepository {
  constructor(private readonly db: Database) {}

  list = async (): Promise<ScheduleEntry[]> => {
    const rows = await this.db.select().from(scheduleEntries).orderBy(scheduleEntries.date)
    return rows.map((row) => ({ date: row.date, puzzleId: row.puzzleId }))
  }

  findByDate = async (date: Iso8601Date): Promise<Option<ScheduleEntry>> => {
    const row = await this.db.query.scheduleEntries.findFirst({
      where: eq(scheduleEntries.date, date),
    })
    return row ? { date: row.date, puzzleId: row.puzzleId } : undefined
  }

  listByPuzzleId = async (puzzleId: PuzzleId): Promise<ScheduleEntry[]> => {
    const rows = await this.db
      .select()
      .from(scheduleEntries)
      .where(eq(scheduleEntries.puzzleId, puzzleId))
      .orderBy(scheduleEntries.date)
    return rows.map((row) => ({ date: row.date, puzzleId: row.puzzleId }))
  }

  set = async (date: Iso8601Date, puzzleId: PuzzleId): Promise<void> => {
    await this.db
      .insert(scheduleEntries)
      .values({ date, puzzleId })
      .onConflictDoUpdate({ target: scheduleEntries.date, set: { puzzleId } })
  }

  remove = async (date: Iso8601Date): Promise<void> => {
    await this.db.delete(scheduleEntries).where(eq(scheduleEntries.date, date))
  }
}
