import { speciesIdSchema } from "@wortle/shared"
import { TRPCError } from "@trpc/server"
import { z } from "zod"

import { apiSpeciesSchema } from "@/api/types"
import { CreateResult, DeleteResult, speciesRepository, UpdateResult } from "@/db/SpeciesRepository"
import { logger } from "@/utils/logger"

import { protectedProcedure, router } from "./init"

export const speciesRouter = router({
  list: protectedProcedure.query(() => speciesRepository.list()),

  get: protectedProcedure.input(z.object({ id: speciesIdSchema })).query(async ({ input }) => {
    const species = await speciesRepository.findById(input.id)
    if (species === undefined) {
      throw new TRPCError({ code: "NOT_FOUND" })
    }
    return species
  }),

  create: protectedProcedure.input(apiSpeciesSchema).mutation(async ({ input }) => {
    const result = await speciesRepository.create(input)
    if (result === CreateResult.ALREADY_EXISTS) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Species with ID "${input.id}" already exists`,
      })
    }
    logger.info("species.created", `Created species ${input.id}`, { speciesId: input.id })
    return input
  }),

  update: protectedProcedure.input(apiSpeciesSchema).mutation(async ({ input }) => {
    const result = await speciesRepository.update(input)
    if (result === UpdateResult.NOT_FOUND) {
      throw new TRPCError({ code: "NOT_FOUND" })
    }
    logger.info("species.updated", `Updated species ${input.id}`, { speciesId: input.id })
    return input
  }),

  delete: protectedProcedure.input(z.object({ id: speciesIdSchema })).mutation(async ({ input }) => {
    const result = await speciesRepository.delete(input.id)
    if (result === DeleteResult.NOT_FOUND) {
      throw new TRPCError({ code: "NOT_FOUND" })
    }
    logger.info("species.deleted", `Deleted species ${input.id}`, { speciesId: input.id })
    return { success: true }
  }),
})
