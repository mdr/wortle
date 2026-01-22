import { assert, Equals } from "tsafe"
import { z } from "zod"

import { PuzzleId } from "@/lib/Puzzle"
import { DefaultSchedule, type Schedule, type ScheduleEntry } from "@/lib/schedule"
import { Iso8601Date, Url } from "@/utils/brandedTypes"

const SCHEDULE_URL = Url("https://data.wortle.app/schedule.json")

const scheduleEntrySchema = z.object({
  date: z.string().transform(Iso8601Date),
  puzzleId: z.number().transform(PuzzleId),
})

const scheduleJsonSchema = z.object({
  schedule: z.array(scheduleEntrySchema),
})

type ScheduleJson = z.infer<typeof scheduleJsonSchema>
assert<Equals<ScheduleJson, { schedule: ScheduleEntry[] }>>()

export const fetchSchedule = async (): Promise<Schedule> => {
  const response = await fetch(SCHEDULE_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch schedule: ${response.status} ${response.statusText}`)
  }
  const json: unknown = await response.json()
  const parsed = scheduleJsonSchema.parse(json)
  return new DefaultSchedule(parsed.schedule)
}
