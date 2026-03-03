import { z } from "zod"

import { type TaxonId, taxonIdSchema } from "./taxon"

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

export enum License {
  CC_BY_4 = "CC_BY_4",
  CC_BY_SA_4 = "CC_BY_SA_4",
}

const LICENSE_DISPLAY_NAMES: Record<License, string> = {
  [License.CC_BY_4]: "CC BY 4.0",
  [License.CC_BY_SA_4]: "CC BY-SA 4.0",
}

const LICENSE_URLS: Record<License, string> = {
  [License.CC_BY_4]: "https://creativecommons.org/licenses/by/4.0/",
  [License.CC_BY_SA_4]: "https://creativecommons.org/licenses/by-sa/4.0/",
}

export const getLicenseDisplayName = (license: License): string => LICENSE_DISPLAY_NAMES[license]

export const getLicenseUrl = (license: License): string => LICENSE_URLS[license]

export const isShareAlikeLicense = (license: License): boolean => license === License.CC_BY_SA_4

// Map license strings to enum values (includes legacy "CC-BY 4.0" format from existing data)
const LICENSE_MAP = new Map<string, License>([
  ["CC-BY 4.0", License.CC_BY_4],
  [License.CC_BY_4, License.CC_BY_4],
  [License.CC_BY_SA_4, License.CC_BY_SA_4],
])

const licenseSchema = z.string().transform((val, ctx) => {
  const license = LICENSE_MAP.get(val)
  if (license === undefined) {
    ctx.addIssue({
      code: "custom",
      message: `Invalid license: expected one of ${Object.values(License)
        .map((l) => `"${l}"`)
        .join(", ")}`,
    })
    return z.NEVER
  }
  return license
})

export interface PhotoAttribution {
  photographer: string
  license: License
}

export interface Puzzle {
  id: PuzzleId
  speciesId: TaxonId
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
  license: licenseSchema,
})

export const puzzleSchema = z.object({
  id: puzzleIdSchema,
  speciesId: taxonIdSchema,
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

// Re-export TaxonId for convenience
export { type TaxonId, taxonIdSchema } from "./taxon"
