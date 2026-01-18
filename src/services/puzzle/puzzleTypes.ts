import { SpeciesId } from "@/lib/species/Species"
import { DailyResult } from "@/lib/statsStorage/StatsStorage"

export interface PuzzleCompletion {
  result: DailyResult
  attemptedSpeciesIds: SpeciesId[]
}
