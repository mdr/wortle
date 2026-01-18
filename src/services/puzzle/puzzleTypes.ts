import { DailyResult } from "@/lib/gameStorage/GameState"
import { SpeciesId } from "@/lib/species/Species"

export interface PuzzleCompletion {
  result: DailyResult
  attemptedSpeciesIds: SpeciesId[]
}
