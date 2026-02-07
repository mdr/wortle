import {
  BucketName,
  PUZZLES_DATA_KEY,
  SPECIES_DATA_KEY,
  puzzlesDataJsonSchema,
  speciesDataJsonSchema,
} from "@wortle/shared"

import { IPuzzleRepository } from "@/db/PuzzleRepository"
import { ISpeciesRepository } from "@/db/SpeciesRepository"
import { dbPuzzlesToPuzzlesData } from "@/db/toPuzzle"
import { dbSpeciesToSpeciesData } from "@/db/toSpecies"
import { serverLogger } from "@/utils/logger"
import { IBucketStorage } from "@/utils/R2BucketStorage"

import { protectedProcedure, router } from "./init"
import { cleanupOrphanImages, syncDirtyImages } from "./publishImages"

interface PublishRouterDeps {
  speciesRepository: ISpeciesRepository
  puzzleRepository: IPuzzleRepository
  bucketStorage: IBucketStorage
  dataBucketName: BucketName
}

export const createPublishRouter = ({
  speciesRepository,
  puzzleRepository,
  bucketStorage,
  dataBucketName,
}: PublishRouterDeps) =>
  router({
    all: protectedProcedure.mutation(async () => {
      const puzzlesWithStatus = await puzzleRepository.listWithSyncStatus()
      const allPuzzles = puzzlesWithStatus.map((p) => p.puzzle)
      const dirtyPuzzles = puzzlesWithStatus.filter((p) => !p.imagesSynced).map((p) => p.puzzle)

      await syncDirtyImages({ dirtyPuzzles, bucketStorage })
      await puzzleRepository.markImagesSynced(dirtyPuzzles.map((p) => p.id))

      const puzzlesData = dbPuzzlesToPuzzlesData(allPuzzles)
      const validatedPuzzles = puzzlesDataJsonSchema.parse(puzzlesData)
      await bucketStorage.uploadJson({
        bucket: dataBucketName,
        key: PUZZLES_DATA_KEY,
        body: validatedPuzzles,
      })
      serverLogger.info("publish.all", `Uploaded ${PUZZLES_DATA_KEY}`, {
        puzzleCount: validatedPuzzles.puzzles.length,
        bucket: dataBucketName,
      })

      const speciesList = await speciesRepository.list()
      const speciesData = dbSpeciesToSpeciesData(speciesList)
      const validatedSpecies = speciesDataJsonSchema.parse(speciesData)
      await bucketStorage.uploadJson({
        bucket: dataBucketName,
        key: SPECIES_DATA_KEY,
        body: validatedSpecies,
      })
      serverLogger.info("publish.all", `Uploaded ${SPECIES_DATA_KEY}`, {
        speciesCount: validatedSpecies.species.length,
        bucket: dataBucketName,
      })

      await cleanupOrphanImages({ allPuzzles, bucketStorage })

      serverLogger.info("publish.all", `Published all data`, {
        speciesCount: validatedSpecies.species.length,
        puzzleCount: validatedPuzzles.puzzles.length,
        dirtyImageCount: dirtyPuzzles.length,
        bucket: dataBucketName,
      })

      return {
        success: true,
        speciesCount: validatedSpecies.species.length,
        puzzleCount: validatedPuzzles.puzzles.length,
      }
    }),
  })
