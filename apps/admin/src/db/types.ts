import { commonNameSchema, familySchema, scientificNameSchema, speciesIdSchema, urlSchema } from "@wortle/shared"
import { z } from "zod"

export { SpeciesId } from "@wortle/shared"

const dbSpeciesLinkSchema = z.object({
  name: z.string(),
  url: urlSchema,
})

export const dbSpeciesSchema = z.object({
  id: speciesIdSchema,
  scientificName: scientificNameSchema,
  family: familySchema,
  commonName: commonNameSchema,
  alternativeCommonNames: z.array(commonNameSchema),
  alternativeScientificNames: z.array(scientificNameSchema).default([]),
  links: z.array(dbSpeciesLinkSchema),
  idTips: z.array(z.string()),
})

export type DbSpeciesLink = z.infer<typeof dbSpeciesLinkSchema>
export type DbSpecies = z.infer<typeof dbSpeciesSchema>
