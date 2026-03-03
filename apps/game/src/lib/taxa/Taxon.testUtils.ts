import { CommonName, Family, ScientificName, type Taxon, TaxonId } from "@wortle/shared"

export const createTestTaxon = (overrides: Partial<Taxon> & { id: TaxonId }): Taxon => ({
  scientificName: ScientificName("Genus species"),
  family: Family("Testaceae"),
  commonName: CommonName("Common"),
  alternativeCommonNames: [],
  alternativeScientificNames: [],
  links: [],
  idTips: [],
  ...overrides,
})
