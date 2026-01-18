import { assert, Equals } from "tsafe"
import { z } from "zod"

import { PuzzleId } from "@/lib/Puzzle"
import { SpeciesId } from "@/lib/species/Species"
import { Iso8601Date } from "@/utils/brandedTypes"

export enum DailyResult {
  PASS = "PASS",
  FAIL = "FAIL",
}

export interface DailyPuzzleRecord {
  readonly date: Iso8601Date
  readonly puzzleId: PuzzleId
  readonly result: DailyResult
  readonly attemptedSpeciesIds: SpeciesId[]
}

export interface DailyInProgressRecord {
  readonly date: Iso8601Date
  readonly attemptedSpeciesIds: SpeciesId[]
}

export interface GameState {
  readonly history: DailyPuzzleRecord[]
  readonly dailyInProgress?: DailyInProgressRecord
}

const dailyPuzzleRecordSchema: z.ZodType<DailyPuzzleRecord> = z
  .strictObject({
    date: z.string().transform(Iso8601Date),
    puzzleId: z.number().int().transform(PuzzleId),
    result: z.enum([DailyResult.PASS, DailyResult.FAIL]),
    attemptedSpeciesIds: z.array(z.string().transform(SpeciesId)),
  })
  .readonly()

const dailyInProgressRecordSchema: z.ZodType<DailyInProgressRecord> = z
  .strictObject({
    date: z.string().transform(Iso8601Date),
    attemptedSpeciesIds: z.array(z.string().transform(SpeciesId)),
  })
  .readonly()

export const gameStateSchema: z.ZodType<GameState> = z
  .strictObject({
    history: z.array(dailyPuzzleRecordSchema),
    dailyInProgress: dailyInProgressRecordSchema.optional(),
  })
  .readonly()

assert<Equals<GameState, z.infer<typeof gameStateSchema>>>()
