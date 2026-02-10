import { assert, type Equals } from "tsafe"
import { z } from "zod"

import { type Iso8601Date, iso8601DateSchema, type PuzzleId, puzzleIdSchema } from "./puzzle"

export interface ScheduleEntry {
  date: Iso8601Date
  puzzleId: PuzzleId
}

const scheduleEntrySchema = z.object({
  date: z.string().transform((s) => iso8601DateSchema.parse(s)),
  puzzleId: z.number().transform((n) => puzzleIdSchema.parse(n)),
})

export const scheduleJsonSchema = z.object({
  schedule: z.array(scheduleEntrySchema),
})

export interface ScheduleData {
  schedule: ScheduleEntry[]
}

type InferredScheduleData = z.infer<typeof scheduleJsonSchema>
assert<Equals<InferredScheduleData, ScheduleData>>()
