import { Iso8601Date, Option, PuzzleId, ScheduleEntry } from "@wortle/shared"

import { IScheduleRepository } from "./ScheduleRepository"

export class FakeScheduleRepository implements IScheduleRepository {
  private entries: Map<string, ScheduleEntry> = new Map()

  list = (): Promise<ScheduleEntry[]> =>
    Promise.resolve([...this.entries.values()].sort((a, b) => a.date.localeCompare(b.date)))

  findByDate = (date: Iso8601Date): Promise<Option<ScheduleEntry>> => Promise.resolve(this.entries.get(date))

  listByPuzzleId = (puzzleId: PuzzleId): Promise<ScheduleEntry[]> =>
    Promise.resolve(
      [...this.entries.values()].filter((e) => e.puzzleId === puzzleId).sort((a, b) => a.date.localeCompare(b.date)),
    )

  set = (date: Iso8601Date, puzzleId: PuzzleId): Promise<void> => {
    this.entries.set(date, { date, puzzleId })
    return Promise.resolve()
  }

  remove = (date: Iso8601Date): Promise<void> => {
    this.entries.delete(date)
    return Promise.resolve()
  }
}
