import type { SpeciesData, Taxon } from "@wortle/shared"

import type { DbTaxon } from "./types"

export const dbTaxonToTaxon = (dbTaxon: DbTaxon): Taxon => ({
  id: dbTaxon.id,
  scientificName: dbTaxon.scientificName,
  family: dbTaxon.family,
  commonName: dbTaxon.commonName,
  alternativeCommonNames: dbTaxon.alternativeCommonNames,
  alternativeScientificNames: dbTaxon.alternativeScientificNames,
  links: dbTaxon.links,
  idTips: dbTaxon.idTips,
})

export const dbTaxaToSpeciesData = (dbTaxa: DbTaxon[]): SpeciesData => ({
  species: dbTaxa.map(dbTaxonToTaxon).toSorted((a, b) => a.scientificName.localeCompare(b.scientificName)),
})
