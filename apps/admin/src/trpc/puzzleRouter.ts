import { puzzleIdSchema, SpeciesId } from "@wortle/shared"
import { TRPCError } from "@trpc/server"

import {
  createPuzzleRequestToDbPuzzle,
  dbPuzzleToApiPuzzle,
  editPuzzleRequestToDbPuzzle,
} from "@/api/puzzleConversions"
import { createPuzzleRequestSchema, editPuzzleRequestSchema } from "@/api/puzzleTypes"
import { CreateResult, DeleteResult, IPuzzleRepository, UpdateResult } from "@/db/PuzzleRepository"
import { ISpeciesRepository } from "@/db/SpeciesRepository"
import { serverLogger } from "@/utils/logger"

import { TrpcErrorCode } from "./errorCodes"
import { protectedProcedure, router } from "./init"

type PuzzleRouterDeps = {
  puzzleRepository: IPuzzleRepository
  speciesRepository: ISpeciesRepository
}

const validateSpeciesExists = async (speciesRepository: ISpeciesRepository, speciesId: SpeciesId): Promise<void> => {
  const species = await speciesRepository.findById(speciesId)
  if (species === undefined) {
    throw new TRPCError({
      code: TrpcErrorCode.UNPROCESSABLE_CONTENT,
      message: `Species "${speciesId}" does not exist`,
    })
  }
}

export const createPuzzleRouter = ({ puzzleRepository, speciesRepository }: PuzzleRouterDeps) =>
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

    create: protectedProcedure.input(createPuzzleRequestSchema).mutation(async ({ input: request }) => {
      await validateSpeciesExists(speciesRepository, request.speciesId)
      const dbPuzzle = createPuzzleRequestToDbPuzzle(request)
      const result = await puzzleRepository.create(dbPuzzle)
      if (result === CreateResult.ALREADY_EXISTS) {
        throw new TRPCError({
          code: TrpcErrorCode.UNPROCESSABLE_CONTENT,
          message: `Puzzle with ID "${request.id}" already exists`,
        })
      }
      serverLogger.info("puzzle.created", `Created puzzle ${request.id}`, { puzzleId: request.id })
      return dbPuzzleToApiPuzzle(dbPuzzle)
    }),

    update: protectedProcedure.input(editPuzzleRequestSchema).mutation(async ({ input: request }) => {
      await validateSpeciesExists(speciesRepository, request.speciesId)
      const dbPuzzle = editPuzzleRequestToDbPuzzle(request)
      const result = await puzzleRepository.update(dbPuzzle)
      if (result === UpdateResult.NOT_FOUND) {
        throw new TRPCError({ code: TrpcErrorCode.NOT_FOUND })
      }
      serverLogger.info("puzzle.updated", `Updated puzzle ${request.id}`, { puzzleId: request.id })
      return dbPuzzleToApiPuzzle(dbPuzzle)
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
