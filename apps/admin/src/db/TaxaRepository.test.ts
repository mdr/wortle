import { CommonName, Family, ScientificName, TestTaxonIds } from "@wortle/shared"
import { describe, expect, it } from "vitest"

import { CreateResult, DeleteResult, TaxaRepository, UpdateResult } from "./TaxaRepository"
import { createTestDb } from "./testDb.testUtils"
import { DbTaxon } from "./types"

const makeDbTaxon = (overrides: Partial<DbTaxon> = {}): DbTaxon => ({
  id: TestTaxonIds.daisy,
  scientificName: ScientificName("Bellis perennis"),
  family: Family("Asteraceae"),
  commonName: CommonName("Daisy"),
  alternativeCommonNames: [],
  alternativeScientificNames: [],
  links: [],
  idTips: [],
  ...overrides,
})

const makeTaxaRepository = async (): Promise<TaxaRepository> => {
  const { db } = await createTestDb()
  return new TaxaRepository(db)
}

describe("TaxaRepository", () => {
  describe("list", () => {
    it("returns empty array when no taxa exist", async () => {
      const repository = await makeTaxaRepository()

      const result = await repository.list()

      expect(result).toEqual([])
    })

    it("returns all taxa", async () => {
      const repository = await makeTaxaRepository()
      const taxon1 = makeDbTaxon({ id: TestTaxonIds.daisy })
      const taxon2 = makeDbTaxon({ id: TestTaxonIds.tansy })
      await repository.create(taxon1)
      await repository.create(taxon2)

      const result = await repository.list()

      expect(result).toEqual([taxon1, taxon2])
    })
  })

  describe("findById", () => {
    it("returns undefined when taxon does not exist", async () => {
      const repository = await makeTaxaRepository()

      const result = await repository.findById(TestTaxonIds.alexanders)

      expect(result).toBeUndefined()
    })

    it("returns taxon when it exists", async () => {
      const repository = await makeTaxaRepository()
      const taxon = makeDbTaxon()
      await repository.create(taxon)

      const result = await repository.findById(taxon.id)

      expect(result).toEqual(taxon)
    })
  })

  describe("create", () => {
    it("creates a new taxon and returns CREATED", async () => {
      const repository = await makeTaxaRepository()
      const taxon = makeDbTaxon()

      const result = await repository.create(taxon)

      expect(result).toBe(CreateResult.CREATED)
      expect(await repository.findById(taxon.id)).toEqual(taxon)
    })

    it("returns ALREADY_EXISTS when taxon with same id exists", async () => {
      const repository = await makeTaxaRepository()
      const taxon = makeDbTaxon()
      await repository.create(taxon)

      const result = await repository.create(taxon)

      expect(result).toBe(CreateResult.ALREADY_EXISTS)
    })
  })

  describe("update", () => {
    it("returns NOT_FOUND when taxon does not exist", async () => {
      const repository = await makeTaxaRepository()
      const taxon = makeDbTaxon()

      const result = await repository.update(taxon)

      expect(result).toBe(UpdateResult.NOT_FOUND)
    })

    it("updates existing taxon and returns UPDATED", async () => {
      const repository = await makeTaxaRepository()
      const taxon = makeDbTaxon({ commonName: CommonName("Daisy") })
      await repository.create(taxon)

      const updated = { ...taxon, commonName: CommonName("Common Daisy") }
      const result = await repository.update(updated)

      expect(result).toBe(UpdateResult.UPDATED)
      expect(await repository.findById(taxon.id)).toEqual(updated)
    })
  })

  describe("delete", () => {
    it("returns NOT_FOUND when taxon does not exist", async () => {
      const repository = await makeTaxaRepository()

      const result = await repository.delete(TestTaxonIds.alexanders)

      expect(result).toBe(DeleteResult.NOT_FOUND)
    })

    it("deletes existing taxon and returns DELETED", async () => {
      const repository = await makeTaxaRepository()
      const taxon = makeDbTaxon()
      await repository.create(taxon)

      const result = await repository.delete(taxon.id)

      expect(result).toBe(DeleteResult.DELETED)
      expect(await repository.findById(taxon.id)).toBeUndefined()
    })
  })
})
