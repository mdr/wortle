import { assert, Equals } from "tsafe"
import { z } from "zod"

import { PuzzleId } from "@/lib/Puzzle"
import { DefaultSchedule, type Schedule, type ScheduleEntry } from "@/lib/schedule"
import { Iso8601Date, Url } from "@/utils/brandedTypes"

const DEFAULT_DATA_URL = Url("https://data.wortle.app")

const scheduleEntrySchema = z.object({
  date: z.string().transform(Iso8601Date),
  puzzleId: z.number().transform(PuzzleId),
})

const scheduleJsonSchema = z.object({
  schedule: z.array(scheduleEntrySchema),
})

interface ScheduleJson {
  schedule: ScheduleEntry[]
}

type InferredScheduleJson = z.infer<typeof scheduleJsonSchema>
assert<Equals<InferredScheduleJson, ScheduleJson>>()

export class DataApi {
  constructor(private readonly baseUrl: Url = DEFAULT_DATA_URL) {}

  fetchSchedule = async (): Promise<Schedule> => {
    const response = await fetch(`${this.baseUrl}/schedule.json`)
    if (!response.ok) {
      throw new Error(`Failed to fetch schedule: ${response.status} ${response.statusText}`)
    }
    const json: unknown = await response.json()
    const parsed = scheduleJsonSchema.parse(json)
    return new DefaultSchedule(parsed.schedule)
  }
}

export const dataApi = new DataApi()
