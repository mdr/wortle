import { describe, expect, it } from "vitest"

import { TestSpeciesIds } from "@/lib/testConstants.testUtils"
import { Iso8601Date } from "@/utils/brandedTypes"

import { PassOrFail } from "./HistoryRecord"
import { createHistoryStore, createInProgressAttempt, createPuzzleAttempt } from "./HistoryStore.testUtils"

describe("HistoryStore", () => {
  it("returns default history when empty", () => {
    const store = createHistoryStore()
    expect(store.load()).toEqual({ attempts: [] })
  })

  it("persists and loads history", () => {
    const store = createHistoryStore()
    store.saveAttempt({
      date: Iso8601Date("2026-06-08"),
      result: PassOrFail.PASS,
      submittedSpecies: [TestSpeciesIds.birdsFootTrefoil, TestSpeciesIds.herbRobert],
    })

    expect(store.load()).toEqual({
      attempts: [
        {
          date: Iso8601Date("2026-06-08"),
          result: PassOrFail.PASS,
          submittedSpecies: [TestSpeciesIds.birdsFootTrefoil, TestSpeciesIds.herbRobert],
        },
      ],
    })
  })

  it("saves in-progress attempt (without result)", () => {
    const store = createHistoryStore()

    store.saveAttempt(createInProgressAttempt())

    expect(store.load()).toEqual({
      attempts: [createInProgressAttempt()],
    })
  })

  it("updates in-progress attempt to completed", () => {
    const store = createHistoryStore()
    const date = Iso8601Date("2026-06-08")
    store.saveAttempt(createInProgressAttempt({ date }))

    store.saveAttempt(createPuzzleAttempt({ date, result: PassOrFail.PASS }))

    expect(store.load().attempts).toHaveLength(1)
    expect(store.load().attempts[0]?.result).toBe(PassOrFail.PASS)
  })

  it("replaces existing attempt for same date", () => {
    const store = createHistoryStore()
    const date = Iso8601Date("2026-06-08")
    store.saveAttempt(createPuzzleAttempt({ date, result: PassOrFail.FAIL }))

    store.saveAttempt(createPuzzleAttempt({ date, result: PassOrFail.PASS }))

    expect(store.load().attempts).toHaveLength(1)
    expect(store.load().attempts[0]?.result).toBe(PassOrFail.PASS)
  })

  it("keeps attempts sorted by date", () => {
    const store = createHistoryStore()
    const earliest = Iso8601Date("2026-06-08")
    const middle = Iso8601Date("2026-06-09")
    const latest = Iso8601Date("2026-06-10")
    store.saveAttempt(createPuzzleAttempt({ date: middle }))
    store.saveAttempt(createPuzzleAttempt({ date: latest }))
    store.saveAttempt(createPuzzleAttempt({ date: earliest }))

    const attempts = store.load().attempts
    expect(attempts.map((a) => a.date)).toEqual([earliest, middle, latest])
  })
})
