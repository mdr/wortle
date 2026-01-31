import { speciesIdSchema } from "@wortle/shared"
import { TRPCError } from "@trpc/server"

import { toApiSpecies, toDbSpecies } from "@/api/speciesConversions"
import { apiSpeciesSchema } from "@/api/types"
import { speciesRepository } from "@/db"
import { CreateResult, DeleteResult, UpdateResult } from "@/db/SpeciesRepository"
import { logger } from "@/utils/logger"

import { TrpcErrorCode } from "./errorCodes"
import { protectedProcedure, router } from "./init"

export const speciesRouter = router({
  list: protectedProcedure.query(async () => {
    const dbSpecies = await speciesRepository.list()
    return dbSpecies.map(toApiSpecies)
  }),

  get: protectedProcedure.input(speciesIdSchema).query(async ({ input: speciesId }) => {
    const dbSpecies = await speciesRepository.findById(speciesId)
    if (dbSpecies === undefined) {
      throw new TRPCError({ code: TrpcErrorCode.NOT_FOUND })
    }
    return toApiSpecies(dbSpecies)
  }),

  create: protectedProcedure.input(apiSpeciesSchema).mutation(async ({ input: apiSpecies }) => {
    const result = await speciesRepository.create(toDbSpecies(apiSpecies))
    if (result === CreateResult.ALREADY_EXISTS) {
      throw new TRPCError({
        code: TrpcErrorCode.CONFLICT,
        message: `Species with ID "${apiSpecies.id}" already exists`,
      })
    }
    logger.info("species.created", `Created species "${apiSpecies.commonName}"`, { speciesId: apiSpecies.id })
    return apiSpecies
  }),

  update: protectedProcedure.input(apiSpeciesSchema).mutation(async ({ input: apiSpecies }) => {
    const result = await speciesRepository.update(toDbSpecies(apiSpecies))
    if (result === UpdateResult.NOT_FOUND) {
      throw new TRPCError({ code: TrpcErrorCode.NOT_FOUND })
    }
    logger.info("species.updated", `Updated species "${apiSpecies.commonName}"`, { speciesId: apiSpecies.id })
    return apiSpecies
  }),

  delete: protectedProcedure.input(speciesIdSchema).mutation(async ({ input: speciesId }) => {
    const result = await speciesRepository.delete(speciesId)
    if (result === DeleteResult.NOT_FOUND) {
      throw new TRPCError({ code: TrpcErrorCode.NOT_FOUND })
    }
    logger.info("species.deleted", `Deleted species ${speciesId}`, { speciesId })
    return { success: true }
  }),
})
