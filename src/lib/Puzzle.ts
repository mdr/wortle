import { Brand } from "effect"

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
