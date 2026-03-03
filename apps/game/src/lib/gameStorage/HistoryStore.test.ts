import { Iso8601Date, TestTaxonIds } from "@wortle/shared"
import { describe, expect, it } from "vitest"

import { PassOrFail } from "./HistoryRecord"
import { HistoryStore } from "./HistoryStore"
import { createHistoryStore, createInProgressEntry, createPuzzleHistoryEntry } from "./HistoryStore.testUtils"
import { createMemoryStorage } from "./storage.testUtils"

const STORAGE_KEY = "wortle:temp:6:history"

describe("HistoryStore", () => {
  it("returns default history when empty", () => {
    const store = createHistoryStore()
    expect(store.load()).toEqual({ entries: [] })
  })

  it("persists and loads history", () => {
    const store = createHistoryStore()
    store.saveEntry({
      date: Iso8601Date("2026-06-08"),
      result: PassOrFail.PASS,
      submittedSpecies: [TestTaxonIds.birdsFootTrefoil, TestTaxonIds.herbRobert],
    })

    expect(store.load()).toEqual({
      entries: [
        {
          date: Iso8601Date("2026-06-08"),
          result: PassOrFail.PASS,
          submittedSpecies: [TestTaxonIds.birdsFootTrefoil, TestTaxonIds.herbRobert],
        },
      ],
    })
  })

  it("saves in-progress entry (without result)", () => {
    const store = createHistoryStore()

    store.saveEntry(createInProgressEntry())

    expect(store.load()).toEqual({
      entries: [createInProgressEntry()],
    })
  })

  it("updates in-progress entry to completed", () => {
    const store = createHistoryStore()
    const date = Iso8601Date("2026-06-08")
    store.saveEntry(createInProgressEntry({ date }))

    store.saveEntry(createPuzzleHistoryEntry({ date, result: PassOrFail.PASS }))

    expect(store.load().entries).toHaveLength(1)
    expect(store.load().entries[0]?.result).toBe(PassOrFail.PASS)
  })

  it("replaces existing entry for same date", () => {
    const store = createHistoryStore()
    const date = Iso8601Date("2026-06-08")
    store.saveEntry(createPuzzleHistoryEntry({ date, result: PassOrFail.FAIL }))

    store.saveEntry(createPuzzleHistoryEntry({ date, result: PassOrFail.PASS }))

    expect(store.load().entries).toHaveLength(1)
    expect(store.load().entries[0]?.result).toBe(PassOrFail.PASS)
  })

  it("keeps entries sorted by date", () => {
    const store = createHistoryStore()
    const earliest = Iso8601Date("2026-06-08")
    const middle = Iso8601Date("2026-06-09")
    const latest = Iso8601Date("2026-06-10")
    store.saveEntry(createPuzzleHistoryEntry({ date: middle }))
    store.saveEntry(createPuzzleHistoryEntry({ date: latest }))
    store.saveEntry(createPuzzleHistoryEntry({ date: earliest }))

    const entries = store.load().entries
    expect(entries.map((e) => e.date)).toEqual([earliest, middle, latest])
  })

  it("returns default history when storage contains invalid JSON", () => {
    const storage = createMemoryStorage()
    storage.setItem(STORAGE_KEY, "not valid json {{{")
    const store = new HistoryStore(storage)

    expect(store.load()).toEqual({ entries: [] })
  })

  it("returns default history when storage contains valid JSON but invalid schema", () => {
    const storage = createMemoryStorage()
    storage.setItem(STORAGE_KEY, JSON.stringify({ entries: [{ invalid: "data" }] }))
    const store = new HistoryStore(storage)

    expect(store.load()).toEqual({ entries: [] })
  })
})
