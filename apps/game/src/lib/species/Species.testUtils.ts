import { CommonName, Family, ScientificName, type Species, SpeciesId } from "@wortle/shared"

export const createTestSpecies = (overrides: Partial<Species> & { id: SpeciesId }): Species => ({
  scientificName: ScientificName("Genus species"),
  family: Family("Testaceae"),
  commonName: CommonName("Common"),
  alternativeCommonNames: [],
  alternativeScientificNames: [],
  links: [],
  idTips: [],
  ...overrides,
})
