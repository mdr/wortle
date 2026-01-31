import { z } from "zod"

import { type Url, urlSchema } from "./brandedTypes"

export const speciesIdSchema = z.string().brand<"SpeciesId", "inout">()
export type SpeciesId = z.output<typeof speciesIdSchema>
export const SpeciesId = (s: string): SpeciesId => speciesIdSchema.parse(s)

export const scientificNameSchema = z.string().brand<"ScientificName", "inout">()
export type ScientificName = z.output<typeof scientificNameSchema>
export const ScientificName = (s: string): ScientificName => scientificNameSchema.parse(s)

export const commonNameSchema = z.string().brand<"CommonName", "inout">()
export type CommonName = z.output<typeof commonNameSchema>
export const CommonName = (s: string): CommonName => commonNameSchema.parse(s)

export const genusSchema = z.string().brand<"Genus", "inout">()
export type Genus = z.output<typeof genusSchema>
export const Genus = (s: string): Genus => genusSchema.parse(s)

export const familySchema = z.string().brand<"Family", "inout">()
export type Family = z.output<typeof familySchema>
export const Family = (s: string): Family => familySchema.parse(s)

export interface SpeciesLink {
  name: string
  url: Url
}

export interface Species {
  id: SpeciesId
  scientificName: ScientificName
  family: Family
  commonName: CommonName
  alternativeCommonNames: CommonName[]
  links: SpeciesLink[]
  idTips: string[]
}

const speciesLinkSchema = z.object({
  name: z.string(),
  url: urlSchema,
})

const speciesSchema = z.object({
  id: speciesIdSchema,
  scientificName: scientificNameSchema,
  family: familySchema,
  commonName: commonNameSchema,
  alternativeCommonNames: z.array(commonNameSchema),
  links: z.array(speciesLinkSchema),
  idTips: z.array(z.string()),
})

export const speciesDataJsonSchema = z.object({
  species: z.array(speciesSchema),
})

export interface SpeciesData {
  species: Species[]
}
