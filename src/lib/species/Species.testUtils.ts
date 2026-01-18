import { CommonName, ScientificName, Species, SpeciesId } from "./Species"

export const createTestSpecies = (overrides: Partial<Species> & { id: SpeciesId }): Species => ({
  scientificName: ScientificName("Genus species"),
  family: "Family",
  commonName: CommonName("Common"),
  alternativeCommonNames: [],
  links: [],
  idTips: [],
  ...overrides,
})
