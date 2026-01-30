import { CommonName, Family, ScientificName, SpeciesId } from "@wortle/shared"
import { describe, expect, it } from "vitest"

import { CreateResult, DeleteResult, SpeciesRepository, UpdateResult } from "./SpeciesRepository"
import { createTestDb } from "./testDb.testUtils"
import { DbSpecies } from "./types"

const makeDbSpecies = (overrides: Partial<DbSpecies> = {}): DbSpecies => ({
  id: SpeciesId("test-species"),
  scientificName: ScientificName("Bellis perennis"),
  family: Family("Asteraceae"),
  commonName: CommonName("Daisy"),
  alternativeCommonNames: [],
  links: [],
  idTips: [],
  ...overrides,
})

const makeSpeciesRepository = async (): Promise<SpeciesRepository> => {
  const { db } = await createTestDb()
  return new SpeciesRepository(db)
}

describe("SpeciesRepository", () => {
  describe("list", () => {
    it("returns empty array when no species exist", async () => {
      const repository = await makeSpeciesRepository()

      const result = await repository.list()

      expect(result).toEqual([])
    })

    it("returns all species", async () => {
      const repository = await makeSpeciesRepository()
      const species1 = makeDbSpecies({ id: SpeciesId("species-1") })
      const species2 = makeDbSpecies({ id: SpeciesId("species-2") })
      await repository.create(species1)
      await repository.create(species2)

      const result = await repository.list()

      expect(result).toEqual([species1, species2])
    })
  })

  describe("findById", () => {
    it("returns undefined when species does not exist", async () => {
      const repository = await makeSpeciesRepository()

      const result = await repository.findById(SpeciesId("nonexistent"))

      expect(result).toBeUndefined()
    })

    it("returns species when it exists", async () => {
      const repository = await makeSpeciesRepository()
      const species = makeDbSpecies()
      await repository.create(species)

      const result = await repository.findById(species.id)

      expect(result).toEqual(species)
    })
  })

  describe("create", () => {
    it("creates a new species and returns CREATED", async () => {
      const repository = await makeSpeciesRepository()
      const species = makeDbSpecies()

      const result = await repository.create(species)

      expect(result).toBe(CreateResult.CREATED)
      expect(await repository.findById(species.id)).toEqual(species)
    })

    it("returns ALREADY_EXISTS when species with same id exists", async () => {
      const repository = await makeSpeciesRepository()
      const species = makeDbSpecies()
      await repository.create(species)

      const result = await repository.create(species)

      expect(result).toBe(CreateResult.ALREADY_EXISTS)
    })
  })

  describe("update", () => {
    it("returns NOT_FOUND when species does not exist", async () => {
      const repository = await makeSpeciesRepository()
      const species = makeDbSpecies()

      const result = await repository.update(species)

      expect(result).toBe(UpdateResult.NOT_FOUND)
    })

    it("updates existing species and returns UPDATED", async () => {
      const repository = await makeSpeciesRepository()
      const species = makeDbSpecies()
      await repository.create(species)
      const updated = { ...species, commonName: CommonName("Common Daisy") }

      const result = await repository.update(updated)

      expect(result).toBe(UpdateResult.UPDATED)
      expect(await repository.findById(species.id)).toEqual(updated)
    })
  })

  describe("delete", () => {
    it("returns NOT_FOUND when species does not exist", async () => {
      const repository = await makeSpeciesRepository()

      const result = await repository.delete(SpeciesId("nonexistent"))

      expect(result).toBe(DeleteResult.NOT_FOUND)
    })

    it("deletes existing species and returns DELETED", async () => {
      const repository = await makeSpeciesRepository()
      const species = makeDbSpecies()
      await repository.create(species)

      const result = await repository.delete(species.id)

      expect(result).toBe(DeleteResult.DELETED)
      expect(await repository.findById(species.id)).toBeUndefined()
    })
  })
})
