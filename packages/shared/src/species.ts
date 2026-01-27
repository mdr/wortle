import { Brand } from "effect"
import { z } from "zod"

import { Url } from "./brandedTypes"

export type SpeciesId = string & Brand.Brand<"SpeciesId">
export const SpeciesId = Brand.nominal<SpeciesId>()

export type ScientificName = string & Brand.Brand<"ScientificName">
export const ScientificName = Brand.nominal<ScientificName>()

export type CommonName = string & Brand.Brand<"CommonName">
export const CommonName = Brand.nominal<CommonName>()

export type Genus = string & Brand.Brand<"Genus">
export const Genus = Brand.nominal<Genus>()

export type Family = string & Brand.Brand<"Family">
export const Family = Brand.nominal<Family>()

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
  url: z.string().transform(Url),
})

const speciesSchema = z.object({
  id: z.string().transform(SpeciesId),
  scientificName: z.string().transform(ScientificName),
  family: z.string().transform(Family),
  commonName: z.string().transform(CommonName),
  alternativeCommonNames: z.array(z.string().transform(CommonName)),
  links: z.array(speciesLinkSchema),
  idTips: z.array(z.string()),
})

export const speciesJsonSchema = z.object({
  species: z.array(speciesSchema),
})

export interface SpeciesData {
  species: Species[]
}
