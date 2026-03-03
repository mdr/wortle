import { commonNameSchema, familySchema, scientificNameSchema, taxonIdSchema, urlSchema } from "@wortle/shared"
import { z } from "zod"

export { TaxonId } from "@wortle/shared"

const dbTaxonLinkSchema = z.object({
  name: z.string(),
  url: urlSchema,
})

export const dbTaxonSchema = z.object({
  id: taxonIdSchema,
  scientificName: scientificNameSchema,
  family: familySchema,
  commonName: commonNameSchema,
  alternativeCommonNames: z.array(commonNameSchema),
  alternativeScientificNames: z.array(scientificNameSchema).default([]),
  links: z.array(dbTaxonLinkSchema),
  idTips: z.array(z.string()),
})

export type DbTaxonLink = z.infer<typeof dbTaxonLinkSchema>
export type DbTaxon = z.infer<typeof dbTaxonSchema>
