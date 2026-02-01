import { puzzleIdSchema } from "@wortle/shared"
import { TRPCError } from "@trpc/server"

import { apiPuzzleToDbPuzzle, dbPuzzleToApiPuzzle } from "@/api/puzzleConversions"
import { apiPuzzleSchema } from "@/api/puzzleTypes"
import { CreateResult, DeleteResult, IPuzzleRepository, UpdateResult } from "@/db/PuzzleRepository"
import { serverLogger } from "@/utils/logger"

import { TrpcErrorCode } from "./errorCodes"
import { protectedProcedure, router } from "./init"

export const createPuzzleRouter = (puzzleRepository: IPuzzleRepository) =>
  router({
    list: protectedProcedure.query(async () => {
      const dbPuzzles = await puzzleRepository.list()
      return dbPuzzles.map(dbPuzzleToApiPuzzle)
    }),

    get: protectedProcedure.input(puzzleIdSchema).query(async ({ input: puzzleId }) => {
      const dbPuzzle = await puzzleRepository.findById(puzzleId)
      if (dbPuzzle === undefined) {
        throw new TRPCError({ code: TrpcErrorCode.NOT_FOUND })
      }
      return dbPuzzleToApiPuzzle(dbPuzzle)
    }),

    create: protectedProcedure.input(apiPuzzleSchema).mutation(async ({ input: apiPuzzle }) => {
      const result = await puzzleRepository.create(apiPuzzleToDbPuzzle(apiPuzzle))
      if (result === CreateResult.ALREADY_EXISTS) {
        throw new TRPCError({
          code: TrpcErrorCode.CONFLICT,
          message: `Puzzle with ID "${apiPuzzle.id}" already exists`,
        })
      }
      serverLogger.info("puzzle.created", `Created puzzle ${apiPuzzle.id}`, { puzzleId: apiPuzzle.id })
      return apiPuzzle
    }),

    update: protectedProcedure.input(apiPuzzleSchema).mutation(async ({ input: apiPuzzle }) => {
      const result = await puzzleRepository.update(apiPuzzleToDbPuzzle(apiPuzzle))
      if (result === UpdateResult.NOT_FOUND) {
        throw new TRPCError({ code: TrpcErrorCode.NOT_FOUND })
      }
      serverLogger.info("puzzle.updated", `Updated puzzle ${apiPuzzle.id}`, { puzzleId: apiPuzzle.id })
      return apiPuzzle
    }),

    delete: protectedProcedure.input(puzzleIdSchema).mutation(async ({ input: puzzleId }) => {
      const result = await puzzleRepository.delete(puzzleId)
      if (result === DeleteResult.NOT_FOUND) {
        throw new TRPCError({ code: TrpcErrorCode.NOT_FOUND })
      }
      serverLogger.info("puzzle.deleted", `Deleted puzzle ${puzzleId}`, { puzzleId })
      return { success: true }
    }),
  })
