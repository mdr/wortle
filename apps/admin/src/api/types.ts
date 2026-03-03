import { commonNameSchema, familySchema, scientificNameSchema, taxonIdSchema, urlSchema } from "@wortle/shared"
import { z } from "zod"

const apiTaxonLinkSchema = z.object({
  name: z.string(),
  url: urlSchema,
})

export const apiTaxonSchema = z.object({
  id: taxonIdSchema,
  scientificName: scientificNameSchema,
  family: familySchema,
  commonName: commonNameSchema,
  alternativeCommonNames: z.array(commonNameSchema),
  alternativeScientificNames: z.array(scientificNameSchema),
  links: z.array(apiTaxonLinkSchema),
  idTips: z.array(z.string()),
})

export type ApiTaxonLink = z.infer<typeof apiTaxonLinkSchema>
export type ApiTaxon = z.infer<typeof apiTaxonSchema>
