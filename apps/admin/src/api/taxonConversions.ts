import { DbTaxon } from "@/db/types"

import { ApiTaxon } from "./types"

export const dbTaxonToApiTaxon = (taxon: DbTaxon): ApiTaxon => ({
  id: taxon.id,
  scientificName: taxon.scientificName,
  family: taxon.family,
  commonName: taxon.commonName,
  alternativeCommonNames: taxon.alternativeCommonNames,
  alternativeScientificNames: taxon.alternativeScientificNames,
  links: taxon.links,
  idTips: taxon.idTips,
})

export const apiTaxonToDbTaxon = (taxon: ApiTaxon): DbTaxon => ({
  id: taxon.id,
  scientificName: taxon.scientificName,
  family: taxon.family,
  commonName: taxon.commonName,
  alternativeCommonNames: taxon.alternativeCommonNames,
  alternativeScientificNames: taxon.alternativeScientificNames,
  links: taxon.links,
  idTips: taxon.idTips,
})
