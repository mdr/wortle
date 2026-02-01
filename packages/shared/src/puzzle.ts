import { z } from "zod"

import { type SpeciesId, speciesIdSchema } from "./species"

export const puzzleIdSchema = z.number().int().positive().brand<"PuzzleId", "inout">()
export type PuzzleId = z.output<typeof puzzleIdSchema>
export const PuzzleId = (n: number): PuzzleId => puzzleIdSchema.parse(n)

export const imageKeySchema = z.string().min(1).brand<"ImageKey", "inout">()
export type ImageKey = z.output<typeof imageKeySchema>
export const ImageKey = (s: string): ImageKey => imageKeySchema.parse(s)

export const iso8601DateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format")
  .brand<"Iso8601Date", "inout">()
export type Iso8601Date = z.output<typeof iso8601DateSchema>
export const Iso8601Date = (s: string): Iso8601Date => iso8601DateSchema.parse(s)
export const isIso8601Date = (s: string): s is Iso8601Date => iso8601DateSchema.safeParse(s).success

export const degreesSchema = z.number().brand<"Degrees", "inout">()
export type Degrees = z.output<typeof degreesSchema>
export const Degrees = (n: number): Degrees => degreesSchema.parse(n)

export interface Coordinates {
  latitude: Degrees
  longitude: Degrees
}

export interface Location {
  description: string
  coordinates: Coordinates
}

export interface PuzzleImage {
  imageKey: ImageKey
  caption: string
}

export interface PhotoAttribution {
  photographer: string
  license: string
}

export interface Puzzle {
  id: PuzzleId
  speciesId: SpeciesId
  observationDate: Iso8601Date
  location: Location
  habitat: string
  images: PuzzleImage[]
  photoAttribution: PhotoAttribution
}

const coordinatesSchema = z.object({
  latitude: degreesSchema,
  longitude: degreesSchema,
})

const locationSchema = z.object({
  description: z.string(),
  coordinates: coordinatesSchema,
})

const puzzleImageSchema = z.object({
  imageKey: imageKeySchema,
  caption: z.string(),
})

const photoAttributionSchema = z.object({
  photographer: z.string(),
  license: z.string(),
})

export const puzzleSchema = z.object({
  id: puzzleIdSchema,
  speciesId: speciesIdSchema,
  observationDate: iso8601DateSchema,
  location: locationSchema,
  habitat: z.string(),
  images: z.array(puzzleImageSchema),
  photoAttribution: photoAttributionSchema,
})

export const puzzlesDataJsonSchema = z.object({
  puzzles: z.array(puzzleSchema),
})

export interface PuzzlesData {
  puzzles: Puzzle[]
}

// Re-export SpeciesId for convenience
export { type SpeciesId, speciesIdSchema } from "./species"
