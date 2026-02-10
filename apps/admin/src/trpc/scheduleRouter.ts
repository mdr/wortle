import { iso8601DateSchema, puzzleIdSchema } from "@wortle/shared"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { IPuzzleRepository } from "@/db/PuzzleRepository"
import { IScheduleRepository } from "@/db/ScheduleRepository"
import { serverLogger } from "@/utils/logger"

import { TrpcErrorCode } from "./errorCodes"
import { protectedProcedure, router } from "./init"

interface ScheduleRouterDeps {
  scheduleRepository: IScheduleRepository
  puzzleRepository: IPuzzleRepository
}

const setInputSchema = z.object({
  date: iso8601DateSchema,
  puzzleId: puzzleIdSchema,
})

export const createScheduleRouter = ({ scheduleRepository, puzzleRepository }: ScheduleRouterDeps) =>
  router({
    list: protectedProcedure.query(async () => scheduleRepository.list()),

    set: protectedProcedure.input(setInputSchema).mutation(async ({ input }) => {
      const puzzle = await puzzleRepository.findById(input.puzzleId)
      if (puzzle === undefined) {
        throw new TRPCError({
          code: TrpcErrorCode.UNPROCESSABLE_CONTENT,
          message: `Puzzle ${input.puzzleId} does not exist`,
        })
      }
      await scheduleRepository.set(input.date, input.puzzleId)
      serverLogger.info("schedule.set", `Scheduled puzzle ${input.puzzleId} for ${input.date}`, {
        date: input.date,
        puzzleId: input.puzzleId,
      })
      return { success: true }
    }),

    remove: protectedProcedure.input(iso8601DateSchema).mutation(async ({ input: date }) => {
      await scheduleRepository.remove(date)
      serverLogger.info("schedule.remove", `Removed schedule entry for ${date}`, { date })
      return { success: true }
    }),
  })
