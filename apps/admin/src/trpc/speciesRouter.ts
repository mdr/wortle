import { speciesIdSchema } from "@wortle/shared"
import { TRPCError } from "@trpc/server"

import { apiSpeciesToDbSpecies, dbSpeciesToApiSpecies } from "@/api/speciesConversions"
import { apiSpeciesSchema } from "@/api/types"
import { IPuzzleRepository } from "@/db/PuzzleRepository"
import { CreateResult, DeleteResult, ISpeciesRepository, UpdateResult } from "@/db/SpeciesRepository"
import { serverLogger } from "@/utils/logger"

import { TrpcErrorCode } from "./errorCodes"
import { protectedProcedure, router } from "./init"

export const createSpeciesRouter = (speciesRepository: ISpeciesRepository, puzzleRepository: IPuzzleRepository) =>
  router({
    list: protectedProcedure.query(async () => {
      const dbSpecies = await speciesRepository.list()
      return dbSpecies.map(dbSpeciesToApiSpecies)
    }),

    get: protectedProcedure.input(speciesIdSchema).query(async ({ input: speciesId }) => {
      const dbSpecies = await speciesRepository.findById(speciesId)
      if (dbSpecies === undefined) {
        throw new TRPCError({ code: TrpcErrorCode.NOT_FOUND })
      }
      return dbSpeciesToApiSpecies(dbSpecies)
    }),

    create: protectedProcedure.input(apiSpeciesSchema).mutation(async ({ input: apiSpecies }) => {
      const result = await speciesRepository.create(apiSpeciesToDbSpecies(apiSpecies))
      if (result === CreateResult.ALREADY_EXISTS) {
        throw new TRPCError({
          code: TrpcErrorCode.UNPROCESSABLE_CONTENT,
          message: `Species with ID "${apiSpecies.id}" already exists`,
        })
      }
      serverLogger.info("species.created", `Created species "${apiSpecies.commonName}"`, { speciesId: apiSpecies.id })
      return apiSpecies
    }),

    update: protectedProcedure.input(apiSpeciesSchema).mutation(async ({ input: apiSpecies }) => {
      const result = await speciesRepository.update(apiSpeciesToDbSpecies(apiSpecies))
      if (result === UpdateResult.NOT_FOUND) {
        throw new TRPCError({ code: TrpcErrorCode.NOT_FOUND })
      }
      serverLogger.info("species.updated", `Updated species "${apiSpecies.commonName}"`, { speciesId: apiSpecies.id })
      return apiSpecies
    }),

    delete: protectedProcedure.input(speciesIdSchema).mutation(async ({ input: speciesId }) => {
      const puzzleCount = await puzzleRepository.countBySpeciesId(speciesId)
      if (puzzleCount > 0) {
        throw new TRPCError({
          code: TrpcErrorCode.UNPROCESSABLE_CONTENT,
          message: `Cannot delete species: ${puzzleCount} puzzle${puzzleCount === 1 ? "" : "s"} references it`,
        })
      }
      const result = await speciesRepository.delete(speciesId)
      if (result === DeleteResult.NOT_FOUND) {
        throw new TRPCError({ code: TrpcErrorCode.NOT_FOUND })
      }
      serverLogger.info("species.deleted", `Deleted species ${speciesId}`, { speciesId })
      return { success: true }
    }),
  })
