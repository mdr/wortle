import { CommonName, Family, ScientificName, SpeciesId, Url } from "@wortle/shared"
import { z } from "zod"

const apiSpeciesLinkSchema = z.object({
  name: z.string(),
  url: z.string().transform(Url),
})

export const apiSpeciesSchema = z.object({
  id: z.string().transform(SpeciesId),
  scientificName: z.string().transform(ScientificName),
  family: z.string().transform(Family),
  commonName: z.string().transform(CommonName),
  alternativeCommonNames: z.array(z.string().transform(CommonName)),
  links: z.array(apiSpeciesLinkSchema),
  idTips: z.array(z.string()),
})

export type ApiSpeciesLink = z.infer<typeof apiSpeciesLinkSchema>
export type ApiSpecies = z.infer<typeof apiSpeciesSchema>
