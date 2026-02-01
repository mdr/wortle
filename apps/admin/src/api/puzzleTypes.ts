import { degreesSchema, imageKeySchema, iso8601DateSchema, puzzleIdSchema, speciesIdSchema } from "@wortle/shared"
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
})

const apiPhotoAttributionSchema = z.object({
  photographer: z.string(),
  license: z.string(),
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
