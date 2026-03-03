import { z } from "zod"

import { type Url, urlSchema } from "./brandedTypes"

export const taxonIdSchema = z.string().brand<"TaxonId", "inout">()
export type TaxonId = z.output<typeof taxonIdSchema>
export const TaxonId = (s: string): TaxonId => taxonIdSchema.parse(s)

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

export interface TaxonLink {
  name: string
  url: Url
}

export interface Taxon {
  id: TaxonId
  scientificName: ScientificName
  family: Family
  commonName: CommonName
  alternativeCommonNames: CommonName[]
  alternativeScientificNames: ScientificName[]
  links: TaxonLink[]
  idTips: string[]
}

const taxonLinkSchema = z.object({
  name: z.string(),
  url: urlSchema,
})

const taxonSchema = z.object({
  id: taxonIdSchema,
  scientificName: scientificNameSchema,
  family: familySchema,
  commonName: commonNameSchema,
  alternativeCommonNames: z.array(commonNameSchema),
  alternativeScientificNames: z.array(scientificNameSchema).default([]),
  links: z.array(taxonLinkSchema),
  idTips: z.array(z.string()),
})

export const speciesDataJsonSchema = z.object({
  species: z.array(taxonSchema),
})

export interface SpeciesData {
  species: Taxon[]
}

const matchesTaxonQuery = (taxon: Taxon, query: string): boolean => {
  const lowerQuery = query.toLowerCase()
  const allNames = [
    taxon.commonName,
    ...taxon.alternativeCommonNames,
    taxon.scientificName,
    ...taxon.alternativeScientificNames,
  ]
  return allNames.some((name) => name.toLowerCase().includes(lowerQuery))
}

export const filterTaxaByQuery = (taxa: Taxon[], query: string, excludedIds: TaxonId[] = []): Taxon[] =>
  taxa.filter((s) => !excludedIds.includes(s.id) && matchesTaxonQuery(s, query))
