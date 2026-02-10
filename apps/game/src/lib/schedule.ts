import { Iso8601Date, PuzzleId, type ScheduleEntry } from "@wortle/shared"

import { Option } from "@/utils/types/Option"

export { type ScheduleData, type ScheduleEntry, scheduleJsonSchema } from "@wortle/shared"

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
