import { CommonName, Family, ScientificName, Species, SpeciesId } from "./Species"

export const createTestSpecies = (overrides: Partial<Species> & { id: SpeciesId }): Species => ({
  scientificName: ScientificName("Genus species"),
  family: Family("Testaceae"),
  commonName: CommonName("Common"),
  alternativeCommonNames: [],
  links: [],
  idTips: [],
  ...overrides,
})
