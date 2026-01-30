import { speciesIdSchema } from "@wortle/shared"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

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

  get: protectedProcedure.input(z.object({ id: speciesIdSchema })).query(async ({ input }) => {
    const dbSpecies = await speciesRepository.findById(input.id)
    if (dbSpecies === undefined) {
      throw new TRPCError({ code: TrpcErrorCode.NOT_FOUND })
    }
    return toApiSpecies(dbSpecies)
  }),

  create: protectedProcedure.input(apiSpeciesSchema).mutation(async ({ input }) => {
    const result = await speciesRepository.create(toDbSpecies(input))
    if (result === CreateResult.ALREADY_EXISTS) {
      throw new TRPCError({
        code: TrpcErrorCode.CONFLICT,
        message: `Species with ID "${input.id}" already exists`,
      })
    }
    logger.info("species.created", `Created species ${input.id}`, { speciesId: input.id })
    return input
  }),

  update: protectedProcedure.input(apiSpeciesSchema).mutation(async ({ input }) => {
    const result = await speciesRepository.update(toDbSpecies(input))
    if (result === UpdateResult.NOT_FOUND) {
      throw new TRPCError({ code: TrpcErrorCode.NOT_FOUND })
    }
    logger.info("species.updated", `Updated species ${input.id}`, { speciesId: input.id })
    return input
  }),

  delete: protectedProcedure.input(z.object({ id: speciesIdSchema })).mutation(async ({ input }) => {
    const result = await speciesRepository.delete(input.id)
    if (result === DeleteResult.NOT_FOUND) {
      throw new TRPCError({ code: TrpcErrorCode.NOT_FOUND })
    }
    logger.info("species.deleted", `Deleted species ${input.id}`, { speciesId: input.id })
    return { success: true }
  }),
})
