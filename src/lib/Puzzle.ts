import { Brand } from "effect"
import { assert, Equals } from "tsafe"
import { z } from "zod"

import { Degrees, Iso8601Date } from "@/utils/brandedTypes"

import { SpeciesId } from "./species/Species"

export type PuzzleId = number & Brand.Brand<"PuzzleId">
export const PuzzleId = Brand.nominal<PuzzleId>()

export type ImageKey = string & Brand.Brand<"ImageKey">
export const ImageKey = Brand.nominal<ImageKey>()

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
  latitude: z.number().transform(Degrees),
  longitude: z.number().transform(Degrees),
})

const locationSchema = z.object({
  description: z.string(),
  coordinates: coordinatesSchema,
})

const puzzleImageSchema = z.object({
  imageKey: z.string().transform(ImageKey),
  caption: z.string(),
})

const photoAttributionSchema = z.object({
  photographer: z.string(),
  license: z.string(),
})

const puzzleSchema = z.object({
  id: z.number().transform(PuzzleId),
  speciesId: z.string().transform(SpeciesId),
  observationDate: z.string().transform(Iso8601Date),
  location: locationSchema,
  habitat: z.string(),
  images: z.array(puzzleImageSchema),
  photoAttribution: photoAttributionSchema,
})

export const puzzlesJsonSchema = z.object({
  puzzles: z.array(puzzleSchema),
})

export interface PuzzlesJson {
  puzzles: Puzzle[]
}

type InferredPuzzlesJson = z.infer<typeof puzzlesJsonSchema>
assert<Equals<InferredPuzzlesJson, PuzzlesJson>>()
