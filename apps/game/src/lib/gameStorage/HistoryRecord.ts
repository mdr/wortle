import { Iso8601Date, SpeciesId } from "@wortle/shared"
import { assert, Equals } from "tsafe"
import { z } from "zod"

export enum PassOrFail {
  PASS = "PASS",
  FAIL = "FAIL",
}

export interface PuzzleHistoryEntry {
  readonly date: Iso8601Date
  readonly result?: PassOrFail
  readonly submittedSpecies: SpeciesId[]
}

export interface HistoryRecord {
  readonly entries: PuzzleHistoryEntry[]
}

const puzzleHistoryEntrySchema: z.ZodType<PuzzleHistoryEntry> = z
  .strictObject({
    date: z.string().transform(Iso8601Date),
    result: z.enum([PassOrFail.PASS, PassOrFail.FAIL]).optional(),
    submittedSpecies: z.array(z.string().transform(SpeciesId)),
  })
  .readonly()

export const historyRecordSchema: z.ZodType<HistoryRecord> = z
  .strictObject({
    entries: z.array(puzzleHistoryEntrySchema),
  })
  .readonly()

assert<Equals<HistoryRecord, z.infer<typeof historyRecordSchema>>>()
