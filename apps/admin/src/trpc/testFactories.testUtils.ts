import {
  CommonName,
  Degrees,
  Family,
  ImageKey,
  MediaType,
  Iso8601Date,
  License,
  ScientificName,
  TestPuzzleIds,
  TestSpeciesIds,
} from "@wortle/shared"

import { ApiPuzzle, CreatePuzzleRequest, EditPuzzleRequest, PuzzleRequestImage } from "@/api/puzzleTypes"
import { ApiSpecies } from "@/api/types"
import { DbPuzzle } from "@/db/puzzleTypes"
import { DbSpecies } from "@/db/types"

import { Context } from "./init"

export const makeDbSpecies = (overrides: Partial<DbSpecies> = {}): DbSpecies => ({
  id: TestSpeciesIds.daisy,
  scientificName: ScientificName("Bellis perennis"),
  family: Family("Asteraceae"),
  commonName: CommonName("Daisy"),
  alternativeCommonNames: [],
  alternativeScientificNames: [],
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
  alternativeScientificNames: [],
  links: [],
  idTips: [],
  ...overrides,
})

export const makeDbPuzzle = (overrides: Partial<DbPuzzle> = {}): DbPuzzle => ({
  id: TestPuzzleIds.daisy,
  speciesId: TestSpeciesIds.daisy,
  observationDate: Iso8601Date("2025-01-15"),
  location: {
    description: "North Yorkshire, England",
    coordinates: { latitude: Degrees(54.0), longitude: Degrees(-1.5) },
  },
  habitat: "Road verge",
  images: [{ imageKey: ImageKey("whole-plant"), caption: "Whole plant", mediaType: MediaType.IMAGE_JPEG }],
  photoAttribution: { photographer: "Test User", license: License.CC_BY_4 },
  ...overrides,
})

export const makeApiPuzzle = (overrides: Partial<ApiPuzzle> = {}): ApiPuzzle => ({
  id: TestPuzzleIds.daisy,
  speciesId: TestSpeciesIds.daisy,
  observationDate: Iso8601Date("2025-01-15"),
  location: {
    description: "North Yorkshire, England",
    coordinates: { latitude: Degrees(54.0), longitude: Degrees(-1.5) },
  },
  habitat: "Road verge",
  images: [{ imageKey: ImageKey("whole-plant"), caption: "Whole plant", mediaType: MediaType.IMAGE_JPEG }],
  photoAttribution: { photographer: "Test User", license: License.CC_BY_4 },
  ...overrides,
})

export const makeCreatePuzzleRequest = (overrides: Partial<CreatePuzzleRequest> = {}): CreatePuzzleRequest => ({
  id: TestPuzzleIds.daisy,
  speciesId: TestSpeciesIds.daisy,
  observationDate: Iso8601Date("2025-01-15"),
  location: {
    description: "North Yorkshire, England",
    coordinates: { latitude: Degrees(54.0), longitude: Degrees(-1.5) },
  },
  habitat: "Road verge",
  images: [{ imageKey: ImageKey("whole-plant"), caption: "Whole plant", mediaType: MediaType.IMAGE_JPEG }],
  photoAttribution: { photographer: "Test User", license: License.CC_BY_4 },
  ...overrides,
})

export const makeEditPuzzleRequest: (overrides?: Partial<EditPuzzleRequest>) => EditPuzzleRequest =
  makeCreatePuzzleRequest

export const makePuzzleRequestImage = (overrides: Partial<PuzzleRequestImage> = {}): PuzzleRequestImage => ({
  imageKey: ImageKey("whole-plant"),
  caption: "Whole plant",
  mediaType: MediaType.IMAGE_JPEG,
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
