import { type PuzzlesData, puzzlesJsonSchema } from "@/lib/Puzzle"
import { type ScheduleData, scheduleJsonSchema } from "@/lib/schedule"
import { SPECIES_DATA_KEY, type SpeciesData, speciesDataJsonSchema } from "@/lib/species/Species"
import { Url } from "@/utils/brandedTypes"

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- import.meta.env is undefined in Playwright CT tests
export const DEFAULT_DATA_URL = Url(import.meta.env?.VITE_DATA_URL ?? "https://data.wortle.app")

export class DataApi {
  constructor(private readonly baseUrl: Url = DEFAULT_DATA_URL) {}

  fetchSchedule = async (): Promise<ScheduleData> => {
    const response = await fetch(`${this.baseUrl}/schedule.json`)
    if (!response.ok) {
      throw new Error(`Failed to fetch schedule: ${response.status} ${response.statusText}`)
    }
    const json: unknown = await response.json()
    return scheduleJsonSchema.parse(json)
  }

  fetchPuzzles = async (): Promise<PuzzlesData> => {
    const response = await fetch(`${this.baseUrl}/puzzles.json`)
    if (!response.ok) {
      throw new Error(`Failed to fetch puzzles: ${response.status} ${response.statusText}`)
    }
    const json: unknown = await response.json()
    return puzzlesJsonSchema.parse(json)
  }

  fetchSpecies = async (): Promise<SpeciesData> => {
    const response = await fetch(`${this.baseUrl}/${SPECIES_DATA_KEY}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch species: ${response.status} ${response.statusText}`)
    }
    const json: unknown = await response.json()
    return speciesDataJsonSchema.parse(json)
  }
}

export const dataApi = new DataApi()
