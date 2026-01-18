import { Species, SpeciesId } from "./Species"

export const createTestSpecies = (overrides: Partial<Species> & { id: SpeciesId }): Species => ({
  scientificName: "Genus species",
  family: "Family",
  commonName: "Common",
  alternativeCommonNames: [],
  links: [],
  idTips: [],
  ...overrides,
})
