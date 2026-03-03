import {
  BucketName,
  PUZZLES_DATA_KEY,
  SCHEDULE_DATA_KEY,
  SPECIES_DATA_KEY,
  puzzlesDataJsonSchema,
  scheduleJsonSchema,
  speciesDataJsonSchema,
} from "@wortle/shared"

import { IPuzzleRepository } from "@/db/PuzzleRepository"
import { IScheduleRepository } from "@/db/ScheduleRepository"
import { ITaxaRepository } from "@/db/TaxaRepository"
import { dbPuzzlesToPuzzlesData } from "@/db/toPuzzle"
import { dbTaxaToSpeciesData } from "@/db/toTaxon"
import { serverLogger } from "@/utils/logger"
import { IBucketStorage } from "@/utils/R2BucketStorage"

import { protectedProcedure, router } from "./init"
import { cleanupOrphanImages, syncDirtyImages } from "./publishImages"

interface PublishRouterDeps {
  taxaRepository: ITaxaRepository
  puzzleRepository: IPuzzleRepository
  scheduleRepository: IScheduleRepository
  bucketStorage: IBucketStorage
  dataBucketName: BucketName
  originalsBucketName: BucketName
  imagesBucketName: BucketName
}

export const createPublishRouter = ({
  taxaRepository,
  puzzleRepository,
  scheduleRepository,
  bucketStorage,
  dataBucketName,
  originalsBucketName,
  imagesBucketName,
}: PublishRouterDeps) =>
  router({
    all: protectedProcedure.mutation(async () => {
      const puzzlesWithStatus = await puzzleRepository.listWithSyncStatus()
      const allPuzzles = puzzlesWithStatus.map((p) => p.puzzle)
      const dirtyPuzzles = puzzlesWithStatus.filter((p) => !p.imagesSynced).map((p) => p.puzzle)

      await syncDirtyImages({ dirtyPuzzles, bucketStorage, originalsBucketName, imagesBucketName })
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

      const taxaList = await taxaRepository.list()
      const speciesData = dbTaxaToSpeciesData(taxaList)
      const validatedSpecies = speciesDataJsonSchema.parse(speciesData)
      await bucketStorage.uploadJson({
        bucket: dataBucketName,
        key: SPECIES_DATA_KEY,
        body: validatedSpecies,
      })
      serverLogger.info("publish.all", `Uploaded ${SPECIES_DATA_KEY}`, {
        taxaCount: validatedSpecies.species.length,
        bucket: dataBucketName,
      })

      const scheduleEntries = await scheduleRepository.list()
      const scheduleData = { schedule: scheduleEntries }
      const validatedSchedule = scheduleJsonSchema.parse(scheduleData)
      await bucketStorage.uploadJson({
        bucket: dataBucketName,
        key: SCHEDULE_DATA_KEY,
        body: validatedSchedule,
      })
      serverLogger.info("publish.all", `Uploaded ${SCHEDULE_DATA_KEY}`, {
        scheduleEntryCount: validatedSchedule.schedule.length,
        bucket: dataBucketName,
      })

      await cleanupOrphanImages({ allPuzzles, bucketStorage, imagesBucketName })

      serverLogger.info("publish.all", `Published all data`, {
        taxaCount: validatedSpecies.species.length,
        puzzleCount: validatedPuzzles.puzzles.length,
        scheduleEntryCount: validatedSchedule.schedule.length,
        dirtyImageCount: dirtyPuzzles.length,
        bucket: dataBucketName,
      })

      return {
        success: true,
        taxaCount: validatedSpecies.species.length,
        puzzleCount: validatedPuzzles.puzzles.length,
        scheduleEntryCount: validatedSchedule.schedule.length,
      }
    }),
  })
