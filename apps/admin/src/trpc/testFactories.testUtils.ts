import { CommonName, Family, ScientificName, TestSpeciesIds } from "@wortle/shared"

import { ApiSpecies } from "@/api/types"
import { DbSpecies } from "@/db/types"

import { Context } from "./init"

export const makeDbSpecies = (overrides: Partial<DbSpecies> = {}): DbSpecies => ({
  id: TestSpeciesIds.daisy,
  scientificName: ScientificName("Bellis perennis"),
  family: Family("Asteraceae"),
  commonName: CommonName("Daisy"),
  alternativeCommonNames: [],
  links: [],
  idTips: [],
  ...overrides,
})

export const makeApiSpecies = (overrides: Partial<ApiSpecies> = {}): ApiSpecies => ({
  id: TestSpeciesIds.daisy,
  scientificName: ScientificName("Bellis perennis"),
  family: Family("Asteraceae"),
  commonName: CommonName("Daisy"),
  alternativeCommonNames: [],
  links: [],
  idTips: [],
  ...overrides,
})

export const testContext: Context = {
  user: {
    id: "test-user",
    email: "test@example.com",
    given_name: "Test",
    family_name: "User",
    picture: null,
  },
  isSuperUser: true,
}
