import { assert, Equals } from "tsafe"
import { z } from "zod"

import { SpeciesId } from "@/lib/species/Species"
import { Iso8601Date } from "@/utils/brandedTypes"

export enum PassOrFail {
  PASS = "PASS",
  FAIL = "FAIL",
}

export interface PuzzleAttempt {
  readonly date: Iso8601Date
  readonly result?: PassOrFail
  readonly submittedSpecies: SpeciesId[]
}

export interface HistoryRecord {
  readonly attempts: PuzzleAttempt[]
}

const puzzleAttemptSchema: z.ZodType<PuzzleAttempt> = z
  .strictObject({
    date: z.string().transform(Iso8601Date),
    result: z.enum([PassOrFail.PASS, PassOrFail.FAIL]).optional(),
    submittedSpecies: z.array(z.string().transform(SpeciesId)),
  })
  .readonly()

export const historyRecordSchema: z.ZodType<HistoryRecord> = z
  .strictObject({
    attempts: z.array(puzzleAttemptSchema),
  })
  .readonly()

assert<Equals<HistoryRecord, z.infer<typeof historyRecordSchema>>>()
