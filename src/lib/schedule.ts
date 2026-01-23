import { assert, Equals } from "tsafe"
import { z } from "zod"

import { Iso8601Date } from "@/utils/brandedTypes"
import { Option } from "@/utils/types/Option"

import { PuzzleId } from "./Puzzle"

export interface ScheduleEntry {
  date: Iso8601Date
  puzzleId: PuzzleId
}

const scheduleEntrySchema = z.object({
  date: z.string().transform(Iso8601Date),
  puzzleId: z.number().transform(PuzzleId),
})

export const scheduleJsonSchema = z.object({
  schedule: z.array(scheduleEntrySchema),
})

interface ScheduleJson {
  schedule: ScheduleEntry[]
}

type InferredScheduleJson = z.infer<typeof scheduleJsonSchema>
assert<Equals<InferredScheduleJson, ScheduleJson>>()

export interface Schedule {
  findPuzzleForDate: (date: Iso8601Date) => Option<PuzzleId>
  findFirstDateForPuzzle: (puzzleId: PuzzleId) => Option<Iso8601Date>
  getAllScheduledDates: () => Iso8601Date[]
}

export class DefaultSchedule implements Schedule {
  private readonly entries: ScheduleEntry[]

  constructor(entries: ScheduleEntry[]) {
    this.entries = entries
  }

  findPuzzleForDate = (date: Iso8601Date): Option<PuzzleId> =>
    this.entries.find((entry) => entry.date === date)?.puzzleId

  findFirstDateForPuzzle = (puzzleId: PuzzleId): Option<Iso8601Date> =>
    this.entries.find((entry) => entry.puzzleId === puzzleId)?.date

  getAllScheduledDates = (): Iso8601Date[] => this.entries.map((entry) => entry.date)
}

const defaultEntries: ScheduleEntry[] = [
  { date: Iso8601Date("2026-06-08"), puzzleId: PuzzleId(43) },
  { date: Iso8601Date("2026-06-09"), puzzleId: PuzzleId(41) },
  { date: Iso8601Date("2026-06-10"), puzzleId: PuzzleId(42) },
  { date: Iso8601Date("2026-06-11"), puzzleId: PuzzleId(40) },
  { date: Iso8601Date("2026-06-12"), puzzleId: PuzzleId(44) },
]

export const defaultSchedule: Schedule = new DefaultSchedule(defaultEntries)
