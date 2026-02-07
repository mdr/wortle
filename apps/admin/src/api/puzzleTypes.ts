import {
  degreesSchema,
  ImageMediaType,
  imageKeySchema,
  iso8601DateSchema,
  objectKeySchema,
  License,
  puzzleIdSchema,
  speciesIdSchema,
} from "@wortle/shared"
import { z } from "zod"

const apiCoordinatesSchema = z.object({
  latitude: degreesSchema,
  longitude: degreesSchema,
})

const apiLocationSchema = z.object({
  description: z.string(),
  coordinates: apiCoordinatesSchema,
})

const apiPuzzleImageSchema = z.object({
  imageKey: imageKeySchema,
  caption: z.string(),
  mediaType: z.enum(ImageMediaType),
})

const apiPhotoAttributionSchema = z.object({
  photographer: z.string(),
  license: z.enum(License),
})

export const apiPuzzleSchema = z.object({
  id: puzzleIdSchema,
  speciesId: speciesIdSchema,
  observationDate: iso8601DateSchema,
  location: apiLocationSchema,
  habitat: z.string(),
  images: z.array(apiPuzzleImageSchema),
  photoAttribution: apiPhotoAttributionSchema,
})

export type ApiCoordinates = z.infer<typeof apiCoordinatesSchema>
export type ApiLocation = z.infer<typeof apiLocationSchema>
export type ApiPuzzleImage = z.infer<typeof apiPuzzleImageSchema>
export type ApiPhotoAttribution = z.infer<typeof apiPhotoAttributionSchema>
export type ApiPuzzle = z.infer<typeof apiPuzzleSchema>

const puzzleRequestImageSchema = apiPuzzleImageSchema.extend({
  stagingKey: objectKeySchema.optional(),
})

export type PuzzleRequestImage = z.infer<typeof puzzleRequestImageSchema>

export const createPuzzleRequestSchema = apiPuzzleSchema.extend({
  images: z.array(puzzleRequestImageSchema),
})
export type CreatePuzzleRequest = z.infer<typeof createPuzzleRequestSchema>

export const editPuzzleRequestSchema = createPuzzleRequestSchema
export type EditPuzzleRequest = z.infer<typeof editPuzzleRequestSchema>
