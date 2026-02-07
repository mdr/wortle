import { BucketName, ObjectKey, puzzleIdSchema, PuzzleId, SpeciesId } from "@wortle/shared"
import { TRPCError } from "@trpc/server"

import {
  createPuzzleRequestToDbPuzzle,
  dbPuzzleToApiPuzzle,
  editPuzzleRequestToDbPuzzle,
} from "@/api/puzzleConversions"
import { createPuzzleRequestSchema, editPuzzleRequestSchema, PuzzleRequestImage } from "@/api/puzzleTypes"
import { CreateResult, DeleteResult, IPuzzleRepository, UpdateResult } from "@/db/PuzzleRepository"
import { ISpeciesRepository } from "@/db/SpeciesRepository"
import { imageMediaTypeExtension } from "@/utils/imageMediaType"
import { serverLogger } from "@/utils/logger"
import { IBucketStorage } from "@/utils/R2BucketStorage"

import { TrpcErrorCode } from "./errorCodes"
import { protectedProcedure, router } from "./init"

type PuzzleRouterDeps = {
  puzzleRepository: IPuzzleRepository
  speciesRepository: ISpeciesRepository
  bucketStorage: IBucketStorage
  originalsBucketName: BucketName
}

const validateStagedImagesExist = async (
  bucketStorage: IBucketStorage,
  originalsBucket: BucketName,
  images: PuzzleRequestImage[],
): Promise<void> => {
  for (const image of images) {
    if (image.stagingKey) {
      try {
        await bucketStorage.getObject(originalsBucket, image.stagingKey)
      } catch {
        throw new TRPCError({
          code: TrpcErrorCode.UNPROCESSABLE_CONTENT,
          message: `Staged image not found: ${image.stagingKey}`,
        })
      }
    }
  }
}

const promoteStagedImages = async (
  bucketStorage: IBucketStorage,
  originalsBucket: BucketName,
  puzzleId: PuzzleId,
  images: PuzzleRequestImage[],
): Promise<void> => {
  for (const image of images) {
    if (image.stagingKey) {
      const ext = imageMediaTypeExtension(image.mediaType)
      const dest = ObjectKey(`${puzzleId}/${image.imageKey}${ext}`)
      await bucketStorage.copyObject(originalsBucket, image.stagingKey, originalsBucket, dest)
      await bucketStorage.deleteObject(originalsBucket, image.stagingKey)
    }
  }
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

export const createPuzzleRouter = ({
  puzzleRepository,
  speciesRepository,
  bucketStorage,
  originalsBucketName,
}: PuzzleRouterDeps) =>
  router({
    list: protectedProcedure.query(async () => {
      const puzzlesWithStatus = await puzzleRepository.listWithSyncStatus()
      return puzzlesWithStatus.map(({ puzzle, imagesSynced }) => dbPuzzleToApiPuzzle(puzzle, imagesSynced))
    }),

    get: protectedProcedure.input(puzzleIdSchema).query(async ({ input: puzzleId }) => {
      const result = await puzzleRepository.findByIdWithSyncStatus(puzzleId)
      if (result === undefined) {
        throw new TRPCError({ code: TrpcErrorCode.NOT_FOUND })
      }
      return dbPuzzleToApiPuzzle(result.puzzle, result.imagesSynced)
    }),

    create: protectedProcedure.input(createPuzzleRequestSchema).mutation(async ({ input: request }) => {
      await validateSpeciesExists(speciesRepository, request.speciesId)
      await validateStagedImagesExist(bucketStorage, originalsBucketName, request.images)
      const dbPuzzle = createPuzzleRequestToDbPuzzle(request)
      const result = await puzzleRepository.create(dbPuzzle)
      if (result === CreateResult.ALREADY_EXISTS) {
        throw new TRPCError({
          code: TrpcErrorCode.UNPROCESSABLE_CONTENT,
          message: `Puzzle with ID "${request.id}" already exists`,
        })
      }
      await promoteStagedImages(bucketStorage, originalsBucketName, request.id, request.images)
      serverLogger.info("puzzle.created", `Created puzzle ${request.id}`, { puzzleId: request.id })
      return dbPuzzleToApiPuzzle(dbPuzzle, false)
    }),

    update: protectedProcedure.input(editPuzzleRequestSchema).mutation(async ({ input: request }) => {
      await validateSpeciesExists(speciesRepository, request.speciesId)
      await validateStagedImagesExist(bucketStorage, originalsBucketName, request.images)
      const dbPuzzle = editPuzzleRequestToDbPuzzle(request)
      const result = await puzzleRepository.update(dbPuzzle)
      if (result === UpdateResult.NOT_FOUND) {
        throw new TRPCError({ code: TrpcErrorCode.NOT_FOUND })
      }
      await promoteStagedImages(bucketStorage, originalsBucketName, request.id, request.images)
      serverLogger.info("puzzle.updated", `Updated puzzle ${request.id}`, { puzzleId: request.id })
      return dbPuzzleToApiPuzzle(dbPuzzle, false)
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
