import { Brand } from "effect"

import { Url } from "@/utils/brandedTypes"

export type SpeciesId = string & Brand.Brand<"SpeciesId">
export const SpeciesId = Brand.nominal<SpeciesId>()

export interface SpeciesLink {
  name: string
  url: Url
}

export interface Species {
  id: SpeciesId
  scientificName: string
  family: string
  commonName: string
  alternativeCommonNames: string[]
  links: SpeciesLink[]
  idTips: string[]
}

export const getGenus = (scientificName: string): string => scientificName.split(" ")[0]
