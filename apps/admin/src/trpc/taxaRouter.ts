import { taxonIdSchema } from "@wortle/shared"
import { TRPCError } from "@trpc/server"

import { apiTaxonToDbTaxon, dbTaxonToApiTaxon } from "@/api/taxonConversions"
import { apiTaxonSchema } from "@/api/types"
import { IPuzzleRepository } from "@/db/PuzzleRepository"
import { CreateResult, DeleteResult, ITaxaRepository, UpdateResult } from "@/db/TaxaRepository"
import { serverLogger } from "@/utils/logger"

import { TrpcErrorCode } from "./errorCodes"
import { protectedProcedure, router } from "./init"

export const createTaxaRouter = (taxaRepository: ITaxaRepository, puzzleRepository: IPuzzleRepository) =>
  router({
    list: protectedProcedure.query(async () => {
      const dbTaxa = await taxaRepository.list()
      return dbTaxa.map(dbTaxonToApiTaxon)
    }),

    get: protectedProcedure.input(taxonIdSchema).query(async ({ input: taxonId }) => {
      const dbTaxon = await taxaRepository.findById(taxonId)
      if (dbTaxon === undefined) {
        throw new TRPCError({ code: TrpcErrorCode.NOT_FOUND })
      }
      return dbTaxonToApiTaxon(dbTaxon)
    }),

    create: protectedProcedure.input(apiTaxonSchema).mutation(async ({ input: apiTaxon }) => {
      const result = await taxaRepository.create(apiTaxonToDbTaxon(apiTaxon))
      if (result === CreateResult.ALREADY_EXISTS) {
        throw new TRPCError({
          code: TrpcErrorCode.UNPROCESSABLE_CONTENT,
          message: `Taxon with ID "${apiTaxon.id}" already exists`,
        })
      }
      serverLogger.info("taxon.created", `Created taxon "${apiTaxon.commonName}"`, { taxonId: apiTaxon.id })
      return apiTaxon
    }),

    update: protectedProcedure.input(apiTaxonSchema).mutation(async ({ input: apiTaxon }) => {
      const result = await taxaRepository.update(apiTaxonToDbTaxon(apiTaxon))
      if (result === UpdateResult.NOT_FOUND) {
        throw new TRPCError({ code: TrpcErrorCode.NOT_FOUND })
      }
      serverLogger.info("taxon.updated", `Updated taxon "${apiTaxon.commonName}"`, { taxonId: apiTaxon.id })
      return apiTaxon
    }),

    delete: protectedProcedure.input(taxonIdSchema).mutation(async ({ input: taxonId }) => {
      const puzzleCount = await puzzleRepository.countByTaxonId(taxonId)
      if (puzzleCount > 0) {
        throw new TRPCError({
          code: TrpcErrorCode.UNPROCESSABLE_CONTENT,
          message: `Cannot delete taxon: ${puzzleCount} puzzle${puzzleCount === 1 ? "" : "s"} references it`,
        })
      }
      const result = await taxaRepository.delete(taxonId)
      if (result === DeleteResult.NOT_FOUND) {
        throw new TRPCError({ code: TrpcErrorCode.NOT_FOUND })
      }
      serverLogger.info("taxon.deleted", `Deleted taxon ${taxonId}`, { taxonId })
      return { success: true }
    }),
  })
