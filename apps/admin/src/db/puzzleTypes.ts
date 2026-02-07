import {
  degreesSchema,
  imageKeySchema,
  iso8601DateSchema,
  License,
  MediaType,
  puzzleIdSchema,
  speciesIdSchema,
} from "@wortle/shared"
import { z } from "zod"

import { imageMediaTypeSchema } from "@/utils/imageMediaType"

export { PuzzleId } from "@wortle/shared"
export type { Degrees, ImageKey, Iso8601Date, SpeciesId } from "@wortle/shared"

const dbCoordinatesSchema = z.object({
  latitude: degreesSchema,
  longitude: degreesSchema,
})

const dbLocationSchema = z.object({
  description: z.string(),
  coordinates: dbCoordinatesSchema,
})

const dbPuzzleImageSchema = z.object({
  imageKey: imageKeySchema,
  caption: z.string(),
  mediaType: imageMediaTypeSchema.default(MediaType.IMAGE_JPEG),
})

const dbPhotoAttributionSchema = z.object({
  photographer: z.string(),
  license: z.enum(License),
})

export const dbPuzzleSchema = z.object({
  id: puzzleIdSchema,
  speciesId: speciesIdSchema,
  observationDate: iso8601DateSchema,
  location: dbLocationSchema,
  habitat: z.string(),
  images: z.array(dbPuzzleImageSchema),
  photoAttribution: dbPhotoAttributionSchema,
})

export type DbCoordinates = z.infer<typeof dbCoordinatesSchema>
export type DbLocation = z.infer<typeof dbLocationSchema>
export type DbPuzzleImage = z.infer<typeof dbPuzzleImageSchema>
export type DbPhotoAttribution = z.infer<typeof dbPhotoAttributionSchema>
export type DbPuzzle = z.infer<typeof dbPuzzleSchema>
