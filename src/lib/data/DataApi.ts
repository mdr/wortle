import { puzzlesJsonSchema } from "@/lib/Puzzle"
import { DefaultPuzzles, type Puzzles } from "@/lib/puzzles"
import { DefaultSchedule, type Schedule, scheduleJsonSchema } from "@/lib/schedule"
import { Url } from "@/utils/brandedTypes"

const DEFAULT_DATA_URL = Url("https://data.wortle.app")

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

  fetchPuzzles = async (): Promise<Puzzles> => {
    const response = await fetch(`${this.baseUrl}/puzzles.json`)
    if (!response.ok) {
      throw new Error(`Failed to fetch puzzles: ${response.status} ${response.statusText}`)
    }
    const json: unknown = await response.json()
    const parsed = puzzlesJsonSchema.parse(json)
    return new DefaultPuzzles(parsed.puzzles)
  }
}

export const dataApi = new DataApi()
