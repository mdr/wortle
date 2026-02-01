import { commonNameSchema, familySchema, scientificNameSchema, speciesIdSchema, urlSchema } from "@wortle/shared"
import { z } from "zod"

const apiSpeciesLinkSchema = z.object({
  name: z.string(),
  url: urlSchema,
})

export const apiSpeciesSchema = z.object({
  id: speciesIdSchema,
  scientificName: scientificNameSchema,
  family: familySchema,
  commonName: commonNameSchema,
  alternativeCommonNames: z.array(commonNameSchema),
  alternativeScientificNames: z.array(scientificNameSchema),
  links: z.array(apiSpeciesLinkSchema),
  idTips: z.array(z.string()),
})

export type ApiSpeciesLink = z.infer<typeof apiSpeciesLinkSchema>
export type ApiSpecies = z.infer<typeof apiSpeciesSchema>
